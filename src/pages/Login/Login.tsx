import React, { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/Shared/Input';
import Button from '@/components/Shared/Button';
import * as S from './styles';
import { Link, Redirect, useHistory } from '@/lib/Router';
import { githubLogin } from '@/lib/api/auth/githubLogin';
import { normalLogin } from '@/lib/api/auth/normalLogin';
import {
  validateEmail,
  validateInput,
  validatePassword,
} from '@/utils/validator';
import { notify } from '@/components/Shared/Toastify';
import { useRecoilState } from 'recoil';
import { userState } from '@/recoil/user';
import { getCurrentUser } from '@/lib/api/user/getCurrentUser';
import useInput from '@/hooks/useInput';
import { baepang } from '@/assets';
import Spinner from '@/components/Shared/Spinner';

const Login = () => {
  const [error, setError] = useState({
    email: false,
    password: false,
  });
  const { historyPush } = useHistory();
  const [email, , onChangeEmail] = useInput('');
  const [password, , onChangePassword] = useInput('');
  const [disabled, setDisabled] = useState(true);
  const [isLoading, setLoading] = useState(false);

  const GithubLogin = async () => {
    setLoading(true);
    const { githubUrl } = await githubLogin();
    window.location.href = githubUrl;
  };

  const [user, setUser] = useRecoilState(userState);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    if (emailValidation && passwordValidation) {
      try {
        setDisabled(true);
        await normalLogin({ user_id: email, password });
        const user = await getCurrentUser();
        setDisabled(false);
        setUser(user);
        historyPush('/');
      } catch (err) {
        notify('error', err.message);
        setDisabled(false);
      }
    }
  };

  const errorCheck = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      validateFunction: (param: string) => boolean
    ) => {
      const { name, value } = e.target;
      if (validateFunction(value)) {
        setError({ ...error, [name]: false });
      } else {
        setError({ ...error, [name]: true });
      }
    },
    [error]
  );

  const testLogin = async () => {
    await normalLogin({
      user_id: 'test123@gmail.com',
      password: 'testlogin123@',
    });
    const user = await getCurrentUser();
    setUser(user);
  };

  useEffect(() => {
    if (
      Object.values(error).every((item) => item === false) &&
      email !== '' &&
      password !== ''
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email, password, setDisabled, error]);

  if (user) return <Redirect to="/" />;

  return (
    <S.LoginForm className="container" onSubmit={onSubmit}>
      <S.LoginTitle level={3}>?????? ?????????</S.LoginTitle>
      <Input
        className=" validate-input"
        type="text"
        label="Outlined"
        name="email"
        labelName="?????????"
        placeholder="???????????? ???????????????"
        value={email}
        onChange={onChangeEmail}
        error={error.email}
        onBlur={(e) => errorCheck(e, validateEmail)}
        helperText="????????? ????????? ?????? ????????? ????????????. ex) baemin@gmail.com"
        autoComplete="username"
      />
      <Input
        className=" validate-input"
        type="password"
        label="Outlined"
        name="password"
        labelName="????????????"
        placeholder="??????????????? ???????????????"
        value={password}
        onChange={onChangePassword}
        error={error.password}
        onBlur={(e) => errorCheck(e, validateInput)}
        helperText="??????????????? ???????????????."
        autoComplete="current-password"
      />
      <Button type="submit" color="primary" disabled={disabled}>
        ?????????
      </Button>
      <Button type="button" color="black" onClick={GithubLogin}>
        {isLoading ? (
          <Spinner width={20} height={20} />
        ) : (
          <>
            <S.GithubIcon fill="white" />
            GitHub ?????????
          </>
        )}
      </Button>
      <Button type="button" color="white" onClick={testLogin}>
        <S.LogoImg src={baepang} />
        ?????? ???????????? ?????????
      </Button>
      <S.LinkContainer>
        ???????????? ????????????????
        <Link to="/select_auth">???????????? ?????? ??????</Link>
      </S.LinkContainer>
    </S.LoginForm>
  );
};

export default Login;
