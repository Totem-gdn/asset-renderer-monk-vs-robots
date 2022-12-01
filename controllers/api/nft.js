'use strict'
const path = require('path');
const nftHelper = require('../../helpers/dna-parser')
const gm = require('gm');


class NFTController {
  async get(req, res, next) {
    const { type, id } = req.params
    const folderPath = path.resolve(`resources/avatar/`)

    let { width = 1080, height = 1080 } = req.query
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }
    const nft = await nftHelper.get(type, id);
    if (type === 'avatar' && nft) {
      res.setHeader('Content-Type', 'image/png');

      // 0 - man // 1 - woman
      // 1 - Skinny // 0 - Fat
      // 1 - Wimp // 0 - buff

      const sex = nft.sex_bio === 0 ? 'Man' : 'Woman';
      const type = nft.body_type === 0 ? 'Fat' : 'Skinny';
      const str = nft.body_strength === 0 ? '_buff' : '';
      const test = await mergeAvatar(nft, folderPath, sex, type, str);

      gm(test)
        .transparent('white')
        .resize(width, height)
        .stream('png')
        .pipe(res)

    } else {
      res.status(404).json({ error: 'File not found' })
    }

  }

}

function mergeAvatar(nft, folderPath, sex, type, str) {

  return new Promise((resolve, reject) => {
    try {
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
