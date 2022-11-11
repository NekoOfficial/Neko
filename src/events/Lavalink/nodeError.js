module.exports = async (client, node, error) => {
  client.util.error(`Node reported an error: ${error}`, "[Node]");
};
