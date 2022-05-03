# Trusted Setup Bot
This is a discord bot for registering for Twister Cash trusted setup ceremonies.

# Setup
Create a file `.env` then populate it with all of the values in [env.example](./env.example):
```text
FLEEK_API_KEY=
FLEEK_API_SECRET=
ALCHEMY_KEY=
PRIVATE_KEY=
DISCORD_BOT_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

# Usage
Build
```sh
$ sudo make build
```

Run
```sh
sudo make up
```

Run in background
```sh
$ sudo make up-d
```

Shut it down
```sh
$ sudo make down
```

## Slash Commands

#### info
Anyone can use the `/info` command.

#### register
Only discord members with the `contributor` role or the `admin` role may use the `/register` to register an ethereum address. They can register only once. The only way to get the contributor role right now is from @twister-dev in the discord.

#### unregister
Only a discord admin can use unregister, this just resets the discord-side redis registration, but not the coordinator server or contract.

#### skip
Only a discord admin can skip a user. Useful if the current contributor is unresponsive.

## Listeners

#### ContributionVerified
Listens for the `ContributionVerified` event from the rinkarby trusted setup coordinator contract. Whenever it detects the event, it notifies the discord server.