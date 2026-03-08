import '../css/SocialLogin.css';

type SocialProvider = {
  key: string;
  label: string;
  className: string;
};

type SocialLoginButtonsProps = {
  title?: string;
};

const providers: SocialProvider[] = [
  { key: 'google', label: 'Google', className: 'social-google' },
  { key: 'naver', label: 'Naver', className: 'social-naver' },
  { key: 'kakao', label: 'Kakao', className: 'social-kakao' },
  { key: 'line', label: 'LINE', className: 'social-line' },
  { key: 'yahoo', label: 'Yahoo', className: 'social-yahoo' },
];

function SocialLoginButtons({ title = 'ソーシャルログイン' }: SocialLoginButtonsProps) {
  const backendBaseUrl = (process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost:8081/todaychef').replace(
    /\/$/,
    '',
  );

  const startSocialLogin = (provider: string) => {
    window.location.href = `${backendBaseUrl}/social/start/${provider}`;
  };

  return (
    <div className='social-login-wrap'>
      <div className='social-login-title'>{title}</div>
      <div className='social-login-grid'>
        {providers.map((provider) => (
          <button
            key={provider.key}
            type='button'
            className={`social-login-btn ${provider.className}`}
            onClick={() => startSocialLogin(provider.key)}
          >
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SocialLoginButtons;
