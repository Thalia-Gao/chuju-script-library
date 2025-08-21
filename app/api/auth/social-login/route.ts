import { NextRequest, NextResponse } from 'next/server';

// Jscbc: 此路由负责将用户重定向到第三方OAuth提供商的授权页面
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');

  if (provider !== 'wechat' && provider !== 'qq') {
    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
  }

  // Jscbc: 在此处填写您在QQ或微信开放平台申请的App ID
  const QQ_APP_ID = process.env.QQ_APP_ID || 'YOUR_QQ_APP_ID';
  const WECHAT_APP_ID = process.env.WECHAT_APP_ID || 'YOUR_WECHAT_APP_ID';

  // Jscbc: 这是用户授权后，服务商重定向回来的地址
  const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/social-callback';

  let authUrl = '';

  if (provider === 'qq') {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: QQ_APP_ID,
      redirect_uri: `${REDIRECT_URI}?provider=qq`,
      state: 'chuju_qq_login_state',
    });
    authUrl = `https://graph.qq.com/oauth2.0/authorize?${params.toString()}`;
  } else if (provider === 'wechat') {
    const params = new URLSearchParams({
      appid: WECHAT_APP_ID,
      redirect_uri: `${REDIRECT_URI}?provider=wechat`,
      response_type: 'code',
      scope: 'snsapi_login',
      state: 'chuju_wechat_login_state',
    });
    authUrl = `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}`;
  }

  // Jscbc: 将用户重定向到授权URL
  return NextResponse.redirect(authUrl);
}