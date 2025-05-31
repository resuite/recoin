import { Cell } from 'retend'

const Start = () => {
  const count = Cell.source(0);
  const incrementCount = () => count.set(count.get() + 1);

  return (
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#daffcf] to-[#eed3c9]">
      <main class="max-w-7xl mx-auto p-8 text-center">
        <h1 class="text-5xl font-bold mb-4">
          <span class="inline-block">website.</span>
        </h1>
        <p class="mb-4">You're all set to start building amazing things!</p>
        <p class="text-gray-600">
          Check out the{' '}
          <a
            href="https://github.com/adebola-io/retend"
            target="_blank" rel="noopener noreferrer"
            class="text-blue-600"
          >
            documentation
          </a> to learn more.
        </p>
        <button class="font-[inherit] bg-white border-2 mt-4 border-gray-300 rounded-[7px] px-[15px] py-[10px]" type="button" onClick={incrementCount}>
          Counter Value: {count}
        </button>
      </main>
    </div>
  )
};

export default Start;
  