const express = require("express");

const Dweller = {};

Dweller.onCommand = function(command, result, params) {
    if (command !== 'greet') return;
    result.message = `Hello, ${params.name}!`;
    let age = params.age;
    if (age) {
        assert(age > 17, `You are too young, you can't be here`);
        result.message = result.message + ` You are ${params.age} years old.`;
    }
}

module.exports = Dweller
