'use strict'
var Promise = require('bluebird');
const path = require('path');
const nftHelper = require('../../helpers/dna-parser')
const gm = require('gm');
Promise.promisifyAll(gm.prototype);


class NFTController {
  async get (req, res, next) {
    const { type, id } = req.params
    const folderPath = path.resolve(`resources/avatar/`)

    let { width = 1080, height = 1080, size = 'Full' } = req.query
    if (!type || !id) {
      res.status(404).json({ error: 'Wrong format' })
    }
    const nft = await nftHelper.get(type, id);

    if ( type === 'avatar' && nft) {
        res.setHeader('Content-Type', 'image/png');

          // 0 - man // 1 - woman
          // 1 - Skinny // 0 - Fat
          // 1 - Wimp // 0 - buff
          const rgb = nft.primary_color.replace(/[^\d,]/g, '').split(',');
          const sex = nft.sex_bio === 0 ? 'Man' : 'Woman';
          const type = nft.body_type === 0 ? 'Fat' : 'Skinny';
          const str = nft.body_strength === 0 ? '_buff' : '';
          nft.hair_styles = capitalizeFirstLetter(nft.hair_styles)
          const rgbHair = hexToRgb(nft.human_hair_color);
          const rgbSkin = hexToRgb(nft.human_skin_color);
          const rgbEye = hexToRgb(nft.human_eye_color);

            gm()
            .in('-colorize',[rgbEye.r, rgbEye.g, rgbEye.b])
            .in(`${folderPath}/${sex}/${type}${str}/${size}/Mask/Eye_Mask.png`)

            .in('-colorize',[rgbSkin.r, rgbSkin.g, rgbSkin.b])
            .in(`${folderPath}/${sex}/${type}${str}/${size}/Mask/Skin_Mask.png`)

            //  .fill('blue')
            // .opaque("#00ff00")
            // .in('-fill', 'blue')
            // .in('-opaque', '#00ff00')
            // .in(`${folderPath}/test.png`)

            .in('-colorize',[rgb[0], rgb[1], rgb[2]])
            .in(`${folderPath}/${sex}/${type}${str}/${size}/Mask/Suit_Mask.png`)

            // .in('-fill', nft.human_hair_color)
            // .in('-opaque', '#00ff00')
            .in('-colorize',[rgbHair.r, rgbHair.g, rgbHair.b])
            .in(`${folderPath}/${sex}/${type}${str}/${size}/Mask/Hair/${nft.hair_styles}.png`)

            .in('-compose', 'Multiply')
            .in(`${folderPath}/${sex}/${type}${str}/${size}/${nft.hair_styles}.png`)

            .flatten()
            .resize(width, height)
            .stream('png')
            .pipe(res)
      
    } else {
      res.status(404).json({ error: 'File not found' })
    }
  }
 
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
module.exports = new NFTController()
