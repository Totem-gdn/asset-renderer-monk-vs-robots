'use strict'
const path = require('path');
const nftHelper = require('../../helpers/dna-parser');
const gm = require('gm');
const totemCommonFiles = require('totem-common-files');

const sharp = require('sharp');
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
          sharp(`${folderPathAvatar}/${sex}/${body}/${hair}-min.png`).toBuffer(),
          sharp(`${folderPathAvatar}/${sex}/${body}/Mask/Skin_Mask_${hair}.png`).toBuffer()

        ]).then(values => {
          avatarBuffs[sex][body][hair] = {
            body: values[0],
            mask: values[1]
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
      if (type === 'avatar') {
        mergeAvatar(nft, width, height, res)
      } else {
        mergeItem(nft, width, height, res)
      }
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
}

function mergeAvatar(nft, width, height, res) {
  try {
    const topBottomPadd = height / 100 * 10;
    const leftRightPadd = width / 100 * 20;
    colourMask(avatarBuffs[nft.sex_bio][nft.body_type+nft.body_strength][nft.hair_styles].mask, nft)
    .toBuffer((err, skinBuff) => {
      sharp(avatarBuffs[nft.sex_bio][nft.body_type+nft.body_strength][nft.hair_styles].body)
      .composite([{ input: skinBuff, tile: true, blend: 'multiply' }])
      .toBuffer().then((buff) => {
        sharp(buff).resize(+width, +height, {fit: 'fill'})
      .extend({top: topBottomPadd, bottom: topBottomPadd, background: 'transparent'})
        .pipe(sharp().extend({left: leftRightPadd, right: leftRightPadd, background: '#2a2d3303' }))
        .toBuffer().then((dBuff) => {
          res.send(dBuff)
        })

      })
    })
  } catch (error) {
    res.status(500).json({ error: 'Please try again' })
  }
}

function colourMask(buffer, nft) {
  return gm(buffer)
        .in('-fill', nft.human_skin_color)
        .in('-opaque', '#00ff00')

        .in('-fill', nft.primary_color)
        .in('-opaque', '#ff0000')
        
        .in('-fill', nft.human_eye_color)
        .in('-opaque', '#0000ff')

        .in('-fill', nft.human_hair_color)
        .in('-opaque', '#ffff00')
}

function mergeItem(nft, width, height, res) {
  try {
    const topBottomPadd = height / 100 * 10;
    const leftRightPadd = width / 100 * 20;
    gm(itemsBuffs[nft.weapon_material].mask)
      .in('-fill', nft.primary_color)
      .in('-opaque', '#00ff00')
      .toBuffer((err, buff) => {
        sharp(itemsBuffs[nft.weapon_material].spear)
        .composite([{ input: buff, tile: true, blend: 'multiply' }])
        .toBuffer().then(cBuff => {
          sharp(cBuff).resize(+width, +height, {fit: 'fill'})
          .extend({top: topBottomPadd, bottom: topBottomPadd, background: 'transparent'})
          .pipe(sharp().extend({left: leftRightPadd, right: leftRightPadd, background: '#2a2d3303' }))
          .toBuffer().then((dBuff) => {
            res.send(dBuff)
          })
        })
      })
  } catch (error) {
    res.status(500).json({ error: 'Please try again' })
  }
}
module.exports = new NFTController()
