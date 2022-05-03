const Redis = require('ioredis');
const { id } = require('@ethersproject/hash');

const redis = new Redis(6379, 'discord-redis');

const key = "registrants:withdraw.circom";

function userHash(user) {
    return id(user.id).slice(2, 34);
};

async function register(user) {
    return redis.sadd(key, userHash(user));
};

async function isRegistered(user) {
    return redis.sismember(key, userHash(user));
};

async function unregister(user) {
    return redis.del(key, userHash(user));
};

module.exports = {
    register,
    isRegistered,
    unregister
};