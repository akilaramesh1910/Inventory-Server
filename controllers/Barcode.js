const bwipjs = require('bwip-js');

exports.generateBarcode = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }
        const png = await bwipjs.toBuffer({
        bcid: 'code128', 
        text: text,  
        scale: 3,    
        height: 10,   
        includetext: true,  
        textxalign: 'center', 
      });
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: 'Barcode generation failed' });
  }
};