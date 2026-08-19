
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const SERVER_IP = process.env.SERVER_IP || "YourServerIP";
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all bot commands"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Show Minecraft server information"),

  new SlashCommandBuilder()
    .setName("ip")
    .setDescription("Show Minecraft server IP"),

  new SlashCommandBuilder()
    .setName("rules")
    .setDescription("Show server rules"),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Member to kick")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for kick")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Member to ban")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Reason for ban")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a member")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Member to timeout")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutes")
        .setDescription("Timeout duration in minutes")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10080)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete messages")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("Registering slash commands...");

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands }
      );
      console.log("Guild commands registered!");
    } else {
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log("Global commands registered!");
    }
  } catch (error) {
    console.error("Command registration error:", error);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log("nawazu_xd bot is online!");

  client.user.setActivity("/help | Minecraft", {
    type: 0
  });
});

client.on("guildMemberAdd", async member => {
  if (!WELCOME_CHANNEL_ID) return;

  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("👋 Welcome!")
    .setDescription(
      `Welcome ${member} to **${member.guild.name}**!\n\n` +
      `Enjoy the server and make sure to read the rules.`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: "nawazu_xd Bot" })
    .setTimestamp();

  channel.send({ embeds: [embed] }).catch(console.error);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "help") {
      const embed = new EmbedBuilder()
        .setTitle("🤖 nawazu_xd Bot")
        .setDescription("Here are my available commands:")
        .addFields(
          { name: "🏓 /ping", value: "Check bot latency" },
          { name: "🖥️ /server", value: "Show Minecraft server info" },
          { name: "🌐 /ip", value: "Show Minecraft server IP" },
          { name: "📜 /rules", value: "Show server rules" },
          { name: "🛠️ /kick", value: "Kick a member" },
          { name: "🔨 /ban", value: "Ban a member" },
          { name: "⏱️ /timeout", value: "Timeout a member" },
          { name: "🧹 /clear", value: "Delete messages" }
        )
        .setColor(0x5865F2);

      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "ping") {
      return interaction.reply(
        `🏓 Pong! **${client.ws.ping}ms**`
      );
    }

    if (interaction.commandName === "ip") {
      return interaction.reply(
        `🌐 **Minecraft Server IP:**\n\`${SERVER_IP}\``
      );
    }

    if (interaction.commandName === "server") {
      const embed = new EmbedBuilder()
        .setTitle("🖥️ Minecraft Server")
        .addFields(
          { name: "🌐 IP", value: `\`${SERVER_IP}\``, inline: false },
          { name: "🤖 Bot", value: "Online", inline: true },
          { name: "📡 Ping", value: `${client.ws.ping}ms`, inline: true }
        )
        .setColor(0x00FF00)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "rules") {
      const embed = new EmbedBuilder()
        .setTitle("📜 Server Rules")
        .setDescription(
          "1️⃣ No hacking or cheating\n" +
          "2️⃣ No spam or flooding\n" +
          "3️⃣ No harassment\n" +
          "4️⃣ No advertising\n" +
          "5️⃣ Respect all members\n" +
          "6️⃣ Follow staff instructions\n" +
          "7️⃣ Have fun! 🎮"
        )
        .setColor(0xFF0000);

      return interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === "kick") {
      const user = interaction.options.getUser("user");
      const reason =
        interaction.options.getString("reason") || "No reason provided";

      const member = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);

      if (!member) {
        return interaction.reply({
          content: "❌ Member not found.",
          ephemeral: true
        });
      }

      if (!member.kickable) {
        return interaction.reply({
          content: "❌ I cannot kick this member.",
          ephemeral: true
        });
      }

      await member.kick(reason);

      return interaction.reply(
        `👢 **${user.tag}** was kicked.\nReason: ${reason}`
      );
    }

    if (interaction.commandName === "
