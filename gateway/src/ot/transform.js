function transform(op1, op2) {
  // op1 happened before op2 locally
  // Adjust op2 so it can be applied AFTER op1

  // Case 1 — op1 is insert
  if (op1.type === "insert") {
    if (op2.type === "insert") {
      if (op2.index > op1.index) op2.index += op1.text.length;
    }

    if (op2.type === "delete") {
      if (op2.index >= op1.index)
        op2.index += op1.text.length;
    }
  }

  // Case 2 — op1 is delete
  if (op1.type === "delete") {
    if (op2.type === "insert") {
      if (op2.index > op1.index)
        op2.index -= op1.length;
    }

    if (op2.type === "delete") {
      if (op2.index > op1.index)
        op2.index -= op1.length;
    }
  }

  return op2;
}

module.exports = transform;
