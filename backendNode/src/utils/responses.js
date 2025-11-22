/**
 * Cria uma resposta JSON com encoding UTF-8
 */
function jsonResponse(res, data, status = 200) {
  res.status(status).json(data);
}

module.exports = {
  jsonResponse
};
