'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUserSchema } from '@/lib/schemas/user-schema';
import type { RegisterUserInput } from '@/lib/schemas/user-schema';
import type { UserResponse } from '@/presentation/types/responses/UserResponse';
import type { RegisterResponse, RegisterSuccessResponse, RegisterErrorResponse } from '@/presentation/types/responses/RegisterResponse';
import { useState } from 'react';

const isSuccessResponse = (response: RegisterResponse): response is RegisterSuccessResponse => {
  return 'user' in response;
};

const isErrorResponse = (response: RegisterResponse): response is RegisterErrorResponse => {
  return 'error' in response;
};

export const RegisterForm = () => {
  const [registeredUser, setRegisteredUser] = useState<UserResponse | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    setError,
    reset,
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterUserInput) => {
    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json() as RegisterResponse;

      if (!response.ok && isErrorResponse(responseData)) {
        if ('field' in responseData) {
          setError(responseData.field as keyof RegisterUserInput, {
            type: 'server',
            message: responseData.error,
          });
        } else {
          setError('root', {
            type: 'server',
            message: responseData.error,
          });
        }
        return;
      }

      if (isSuccessResponse(responseData)) {
        setRegisteredUser(responseData.user);
        reset();
      }
    } catch {
      setError('root', {
        type: 'server',
        message: 'サーバーとの通信中にエラーが発生しました',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ユーザー登録
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                名前
              </label>
              <input
                id="name"
                type="text"
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="山田太郎"
                {...register('name')}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                className={`mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="example@example.com"
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {isSubmitSuccessful && registeredUser && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <div className="text-center">
                <h4 className="text-sm font-medium text-green-800">
                  登録が完了しました
                </h4>
                <div className="mt-2 text-sm text-green-700">
                  <p className="font-medium">{registeredUser.name}様</p>
                  <p className="mt-1">メールアドレス: {registeredUser.email}</p>
                  <p className="mt-2">新しいユーザーとして登録されました。</p>
                </div>
              </div>
            </div>
          )}

          {errors.root && (
            <div className="text-red-600 text-sm text-center" role="alert">
              {errors.root.message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? '送信中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 