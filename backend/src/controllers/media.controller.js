const Message = require('../models/Message');
const { getMediaUrl, downloadMedia } = require('../services/whatsapp.service');

// Proxies a WhatsApp media message on demand — never stores the bytes.
// Meta's signed URLs expire after a few minutes, so this re-resolves the
// URL from the stored mediaId on every request rather than caching it.
async function getMedia(req, res) {
  const message = await Message.findById(req.params.messageId);
  if (!message || !message.mediaId) {
    return res.status(404).json({ success: false, message: 'Media not found.' });
  }

  try {
    const meta = await getMediaUrl(message.mediaId);
    const { buffer, contentType } = await downloadMedia(meta.url);

    res.set('Content-Type', contentType || message.mediaMimeType || 'application/octet-stream');
    res.set('Cache-Control', 'private, max-age=300');
    if (message.mediaFilename) {
      res.set('Content-Disposition', `inline; filename="${message.mediaFilename.replace(/"/g, '')}"`);
    }
    return res.send(buffer);
  } catch (error) {
    console.error('Media fetch failed:', error.message);
    return res.status(502).json({ success: false, message: 'Could not fetch media from WhatsApp right now.' });
  }
}

module.exports = { getMedia };
