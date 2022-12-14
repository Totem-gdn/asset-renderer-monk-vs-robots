'use strict'
const path = require('path');
const nftHelper = require('../../helpers/dna-parser')
const gm = require('gm');
const totemCommonFiles = require('totem-common-files')

const sharp = require('sharp')
const folderPathAvatar = path.resolve(`resources/avatar/`);
const folderPathItem = path.resolve(`resources/item/`);

const typesSex = totemCommonFiles.monkVsRobotsAvatarFilterJson.find(elem => elem.id === 'sex_bio').values;
const typesBody = ['ThinMuscular', 'ThinWimp', 'FatMuscular', 'FatWimp'];
const typesHair = totemCommonFiles.monkVsRobotsAvatarFilterJson.find(elem => elem.id === 'hair_styles').values.map(el => el.key);
const avatarBuffs = {};

function setDataAvatarToBuffer() {

  for (const sex of typesSex) {
    avatarBuffs[sex] = {};
    for (const body of typesBody) {
      avatarBuffs[sex][body] = {};
      for (const hair of typesHair) {
        Promise.all([
          sharp(`${folderPathAvatar}/${sex}/${body}/${hair}.png`).toBuffer(),
          sharp(`${folderPathAvatar}/${sex}/${body}/Mask/Skin_Mask.png`).toBuffer(),
          sharp(`${folderPathAvatar}/${sex}/${body}/Mask/Hair/${hair}.png`).toBuffer()

        ]).then(values => {
          avatarBuffs[sex][body][hair] = {
            body: values[0],
            mask: values[1],
            hair: values[2],
          }
        })
      }
    }
  }
}

const typesWeapon = totemCommonFiles.monkVsRobotsItemFilterJson.find(elem => elem.id === 'weapon_material').values.map(el => el.key);
const itemsBuffs = {};


function setDataItemsToBuffer() {

  for (const weapon of typesWeapon) {
    Promise.all([
      sharp(`${folderPathItem}/${weapon}/${weapon}_Spears.png`).toBuffer(),
      sharp(`${folderPathItem}/${weapon}/${weapon}_Crystal_Mask.png`).toBuffer(),
    ]).then(values => {
      itemsBuffs[weapon] = {
        spear: values[0],
        mask: values[1],
      }
    })
  }
}

setDataAvatarToBuffer();
setDataItemsToBuffer();


class NFTController {
  async get(req, res, next) {
    const { type, id } = req.params

    let { width = 1080, height = 1080 } = req.query
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }
    const nft = await nftHelper.get(type, id);
    if (type && nft) {
      res.setHeader('Content-Type', 'image/png');
      const render = type === 'avatar' ? await mergeAvatar(nft, width, height) : await mergeItem(nft, width, height);
      res.send(render);
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

function mergeAvatar(nft, width, height) {
  return new Promise((resolve, reject) => {
    try {
      colourMask(avatarBuffs[nft.sex_bio][nft.body_type+nft.body_strength][nft.hair_styles].mask, nft, width, height)
      .toBuffer((err, skinBuff) => {
        gm(avatarBuffs[nft.sex_bio][nft.body_type+nft.body_strength][nft.hair_styles].hair)
          .in('-fill', nft.human_hair_color)
          .in('-opaque', '#00ff00')
          .resize(width, height)
          .toBuffer((err, hairBuff) => {
            sharp(avatarBuffs[nft.sex_bio][nft.body_type+nft.body_strength][nft.hair_styles].body)
              .composite([
                { input: skinBuff, tile: true, blend: 'multiply' },
                { input: hairBuff, tile: true, blend: 'over' },
              ])
              .resize(+width, +height)
              .toBuffer().then((buff) => {
                resolve(buff)
              })
          })
      })
    } catch (error) {
      reject(error);
    }
  })
}

function colourMask(buffer, nft, width, height) {
  return gm(buffer)
        .in('-fill', nft.human_skin_color)
        .in('-opaque', '#00ff00')

        .in('-fill', nft.primary_color)
        .in('-opaque', '#ff0000')
        
        .in('-fill', nft.human_eye_color)
        .in('-opaque', '#0000ff')
        .resize(width, height)
}

function mergeItem(nft, width, height) {
  return new Promise((resolve, reject) => {
    try {
      gm(itemsBuffs[nft.weapon_material].mask)
        .in('-fill', nft.primary_color)
        .in('-opaque', '#00ff00')
        .resize(width, height)

        .toBuffer((err, buff) => {
          sharp(itemsBuffs[nft.weapon_material].spear)
          .composite([
            { input: buff, tile: true, blend: 'multiply' },
          ])
          .resize(+width, +height)
          .toBuffer().then((buff) => {
            resolve(buff)
          })
        })
    } catch (error) {
      reject(error);
    }
  })
}
module.exports = new NFTController()
