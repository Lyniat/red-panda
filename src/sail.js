const greetingMessages = [
  "I am Streifi, your cute little discord manager."
];

const serverDownMessages = [
  "Went out of bamboo."
];

const nooneOnlineMessages = [
  "The Himalaya is a lonely place."
];

const userListMessages = [
  "%s make the Himalaya less lonely.",
  "%s are exploring the snow covered bamboo forest."
];

const singularUserMessages = [
  "%s makes the Himalaya less lonely.",
  "%s is exploring the snow covered bamboo forest."
];

function randomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export default {
  get greetings() { return randomMessage(greetingMessages); },
  get serverIsDown() { return randomMessage(serverDownMessages); },

  users(list) {
    if (list.length == 0)
      return randomMessage(nooneOnlineMessages);

    if (list.length > 1) {
      const msg = randomMessage(userListMessages);
      const users = list.length == 2
        ? list.join(' and ')
        : list.slice(0, -1).join(', ') + ', and ' + list.slice(-1);
      return msg.replace('%s', users);
    } else {
      const msg = randomMessage(singularUserMessages);
      return msg.replace('%s', list[0]);
    }
  }
};

