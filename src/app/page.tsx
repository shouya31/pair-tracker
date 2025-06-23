import RegisterUserForm from '@/components/RegisterUserForm';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">新規ユーザー登録</h1>
        <RegisterUserForm />
      </div>
    </div>
  );
}
