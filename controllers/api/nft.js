'use strict'
const path = require('path');
const nftHelper = require('../../helpers/dna-parser')
const gm = require('gm');
console.log('qweqwe');



class NFTController {
  async get(req, res, next) {
    const { type, id } = req.params

    let { width = 1080, height = 1080 } = req.query
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }
    const nft = await nftHelper.get(type, id);
    console.log('nft', nft);
    if (type && nft) {
      res.setHeader('Content-Type', 'image/png');

      // 0 - man // 1 - woman
      // 1 - Skinny // 0 - Fat
      // 1 - Wimp // 0 - buff

      console.log('time', new Date().getTime());
      
      // const render = type === 'avatar' ? await mergeAvatar(nft) : await mergeItem(nft);
      const percentForScale = 100 / 1080 * (width > height ? width : height);

      const folderPath = path.resolve(`resources/avatar/`)
  const sex = nft.sex_bio === 0 ? 'Man' : 'Woman';
  const type = nft.body_type === 0 ? 'Fat' : 'Skinny';
  const str = nft.body_strength === 0 ? '_buff' : '';
      gm()
        .in('-fill', nft.human_eye_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Eye_Mask.png`)

        .in('-fill', nft.human_skin_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Skin_Mask.png`)

        .in('-fill', nft.primary_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Suit_Mask.png`)

        .in('-fill', nft.human_hair_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Hair/${nft.hair_styles}.png`)

        .in('-compose', 'Multiply')
        .in(`${folderPath}/${sex}/${type}${str}/${nft.hair_styles}.png`)
        .background('#2a2d33')
        .flatten()
        .stream('png').pipe(res)
        // .toBuffer((err, buff) => {
        //   gm(buff)
        //     .transparent('white')
        //     // .in('-resize', `${width}x${height}`)
        //     .in('-scale', `${percentForScale}%`)
        //     .in(type === 'avatar' ? '-flop' : '')
        //     .in('-bordercolor', 'none')
        //     .in('-border', '10x100')
        //     .stream('png').pipe(res)
        // })
    
       
      console.log('time2', new Date().getTime());


    } else {
      res.status(404).json({ error: 'File not found' })
    }
// 1 ресайз вихідних зображень
// падінги 
// зробити глобальні обєекти з картинок shared object
// маски - 

  }

}

function mergeAvatar(nft) {
  const folderPath = path.resolve(`resources/avatar/`)
  const sex = nft.sex_bio === 0 ? 'Man' : 'Woman';
  const type = nft.body_type === 0 ? 'Fat' : 'Skinny';
  const str = nft.body_strength === 0 ? '_buff' : '';
  // return new Promise((resolve, reject) => {
    // try {
    return  gm()
        .in('-fill', nft.human_eye_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Eye_Mask.png`)

        .in('-fill', nft.human_skin_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Skin_Mask.png`)

        .in('-fill', nft.primary_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Suit_Mask.png`)

        .in('-fill', nft.human_hair_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${sex}/${type}${str}/Mask/Hair/${nft.hair_styles}.png`)

        .in('-compose', 'Multiply')
        .in(`${folderPath}/${sex}/${type}${str}/${nft.hair_styles}.png`)

        .flatten()
        .toBuffer((err, buff) => {
          resolve(buff)
        })
  //   } catch (error) {
  //     reject(error);
  //   }
  // })
}

function mergeItem(nft) {
  const folderPath = path.resolve(`resources/item/`)
  console.log(`${folderPath}/${nft.weapon_material}/${nft.weapon_material}_Crystal_Mask.png`);
  console.log(`${folderPath}/${nft.weapon_material}_Spears.png`);
  return new Promise((resolve, reject) => {
    try {
      gm()
        .in('-fill', nft.primary_color)
        .in('-opaque', '#00ff00')
        .in(`${folderPath}/${nft.weapon_material}/${nft.weapon_material}_Crystal_Mask.png`)

        .in('-compose', 'Multiply')
        .in(`${folderPath}/${nft.weapon_material}/${nft.weapon_material}_Spears.png`)

        .flatten()
        .toBuffer((err, buff) => {
          resolve(buff)
        })
    } catch (error) {
      reject(error);
    }
  })
}
module.exports = new NFTController()
