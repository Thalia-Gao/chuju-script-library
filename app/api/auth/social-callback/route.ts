import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import db from '@/lib/db'; // Jscbc: 假设你有一个数据库模块

// Jscbc: 此路由是用户在第三方平台授权后，被重定向回来的地址
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const provider = searchParams.get('provider');

  if (!code || (provider !== 'wechat' && provider !== 'qq')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    let openid: string | null = null;
    let userInfo: { nickname: string, avatar: string } | null = null;

    // Jscbc: TODO - 在此处填写您在QQ或微信开放平台申请的App Secret
    const QQ_APP_ID = process.env.QQ_APP_ID || 'YOUR_QQ_APP_ID';
    const QQ_APP_SECRET = process.env.QQ_APP_SECRET || 'YOUR_QQ_APP_SECRET';
    const WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID';
    const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || 'YOUR_WECHAT_APP_SECRET';
    const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + `/api/auth/social-callback?provider=${provider}`;

    if (provider === 'qq') {
      // Step 1: 用 code 换取 access_token
      const tokenParams = new URLSearchParams({ grant_type: 'authorization_code', client_id: QQ_APP_ID, client_secret: QQ_APP_SECRET, code, redirect_uri: REDIRECT_URI });
      const tokenRes = await fetch(`https://graph.qq.com/oauth2.0/token?${tokenParams.toString()}`);
      const tokenData = await tokenRes.text();
      const accessToken = new URLSearchParams(tokenData).get('access_token');
      if (!accessToken) throw new Error('Failed to get QQ access token');

      // Step 2: 用 access_token 换取 openid
      const openidRes = await fetch(`https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`);
      const openidData = await openidRes.text(); // Jscbc: 返回的是 callback( {"client_id":"YOUR_APPID","openid":"YOUR_OPENID"} ); 格式
      const matches = openidData.match(/"openid":"(.*?)"/);
      openid = matches ? matches[1] : null;
      if (!openid) throw new Error('Failed to get QQ openid');

      // Step 3: 用 access_token 和 openid 获取用户信息
      const userParams = new URLSearchParams({ access_token: accessToken, oauth_consumer_key: QQ_APP_ID, openid });
      const userRes = await fetch(`https://graph.qq.com/user/get_user_info?${userParams.toString()}`);
      const qqUserInfo = await userRes.json();
      if (qqUserInfo.ret !== 0) throw new Error('Failed to get QQ user info');
      userInfo = { nickname: qqUserInfo.nickname, avatar: qqUserInfo.figureurl_qq_1 };

    } else if (provider === 'wechat') {
      // Step 1: 用 code 换取 access_token 和 openid
      const tokenParams = new URLSearchParams({ appid: WECHAT_APP_ID, secret: WECHAT_APP_SECRET, code, grant_type: 'authorization_code' });
      const tokenRes = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?${tokenParams.toString()}`);
      const tokenData = await tokenRes.json();
      if (tokenData.errcode) throw new Error(tokenData.errmsg);
      const { access_token, openid: wxOpenid } = tokenData;
      openid = wxOpenid;

      // Step 2: 用 access_token 和 openid 获取用户信息
      const userParams = new URLSearchParams({ access_token, openid, lang: 'zh_CN' });
      const userRes = await fetch(`https://api.weixin.qq.com/sns/userinfo?${userParams.toString()}`);
      const wxUserInfo = await userRes.json();
      if (wxUserInfo.errcode) throw new Error(wxUserInfo.errmsg);
      userInfo = { nickname: wxUserInfo.nickname, avatar: wxUserInfo.headimgurl };
    }

    if (!openid || !userInfo) {
      throw new Error('Failed to get user information from provider');
    }

    // Step 4: 在你的数据库中查找或创建用户
    let user = db.prepare('SELECT * FROM users WHERE openid = ? AND provider = ?').get(openid, provider);
    if (!user) {
      const result = db.prepare('INSERT INTO users (username, openid, provider, avatar) VALUES (?, ?, ?, ?)')
                       .run(userInfo.nickname, openid, provider, userInfo.avatar);
      user = { id: result.lastInsertRowid, username: userInfo.nickname };
    }

    // Step 5: 为用户生成JWT并设置cookie
    const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';
    const token = sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    cookies().set('auth_token', token, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });

    // Step 6: 重定向到首页或后台
    return NextResponse.redirect(new URL('/admin', req.url));

  } catch (error: any) {
    console.error('Social login callback error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}