<pre class="text-wrap">
Uploading rules:

--- TLDR ---
For most of these rules, you won't break them accidentally. But you should look at:
1e. & 2a & 3a.
Since they are easy to accidentally break.
------------

To prevent users from uploading packs that might get removed, I have outlined some rules here.
Breaking any of these rules could result in anything from a warning, to a perma-ban. But the rules should be pretty straightforward.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT",
"SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and "OPTIONAL"
in this document are to be interpreted as described in <a
		href="https://datatracker.ietf.org/doc/html/rfc2119"
		class="underline">RFC 2119</a
	>.


1. General code restrictions
   Lets get the obvious stuff out of the way first.

   a. You MUST use your brain :)
      Don't do stuff that's obviously bad. This is a sort of catch-all rule, but it SHOULD be used wisely.

   b. Packs MUST NOT contain any malicious code, or code that is otherwise harmful to the user / users computer / users data / users privacy / otherwise.

   c. You MUST NOT obfuscate code. The code MUST be understandable without modification.
      Moderators CANNOT approve packs that contain code they do not understand. If no moderator understands your code, it won't be approved.

   d. Packs MUST be licensed under an open-source license.
      Some examples of permitted licenses are, but not limited to;
      GPL 2.0, GPL 3.0, MIT, Apache 2.0, or any of the other ones listed in the Hearthstone.js Packager (except "Proprietary".)

   e. Packs MUST declare the correct permissions during configuration.
      For example, if the pack utilizes networking, the `network` permission MUST be `true`.

2. Networking
   Networking security is taken seriously, so there are a few rules related to it.
   If a pack uses networking, it SHOULD have a good reason to.

   a. You MUST check that `game.config.networking.allow.packs` is enabled before doing networking requests.
      You MAY only check this setting once before a burst of requests, but you must reasonably account for changes in the configuration file mid-game.

   b. You MUST NOT run code that's hosted online.
      This is a security risk, since the hosted code ("the payload") can be changed at any time post-approval.

   c. If your pack uses networking, you MUST declare so by setting the `network` permission to `true` when configuring your pack.
      This warns others about potential dangers.

3. File System
   Since file system operations have the potential to be dangerous, there are a few rules on how they're used.

   a. You MUST use the `game.functions.util.fs` function to interact with the file system,
      UNLESS the wrapper doesn't fit your specific needs. Exceptions will be heavily scrutinized.

   b. If your pack uses file system operations, you MUST declare so by setting the `fileSystem` permission to `true` when configuring your pack.
</pre>
