import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#FF6B35] to-[#ff8c5a] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-[#FF6B35] mb-6">
          FoodExpress
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Faça login para acessar sua conta
        </p>
        <SignIn />
      </div>
    </div>
  );
}