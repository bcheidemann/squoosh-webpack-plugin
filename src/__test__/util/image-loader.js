module.exports.pitch = function loader(request) {
  return `export default ${JSON.stringify(request)}`;
}
