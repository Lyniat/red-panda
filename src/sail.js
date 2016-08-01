const greetingMessages = [
  "I am S.A.I.L, your Ship-based Artificial Intelligence Lattice."
];

const serverDownMessages = [
  "That's outside my scanner's detection area.",
  "Reboot process remains uninitiated.",
  "Earth was attacked by an unknown force, and was subsequently annihilated."
];

const nooneOnlineMessages = [
  "The universe is a lonely place.",
  "My sensors indicate that there is little life."
];

const userListMessages = [
  "My sensors have located the following sentient lifeforms: %s",
  "%s make the universe less lonely.",
  "%s are exploring the vast infinite."
];

const singularUserMessages = [
  "My sensors have located the following sentient lifeform: %s",
  "%s makes the universe less lonely.",
  "%s is exploring the vast infinite."
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

