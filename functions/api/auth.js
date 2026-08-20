export async function onRequestGet(context) {
  const { env } = context;
  const client_id = env.GITHUB_CLIENT_ID;
  const redirect_uri = "https://flying.sarge-smiffy.com/api/callback";
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo,user`;
  
  return Response.redirect(authUrl, 302);
}