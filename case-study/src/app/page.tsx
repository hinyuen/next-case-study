'use client';
export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-2xl font-bold mb-4">Where is My Order?</h1>
                <form
                    className="flex flex-col gap-4 w-full max-w-md bg-white/80 dark:bg-black/30 p-6 rounded shadow"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <label className="flex flex-col gap-1">
                        <span className="font-medium">
                            Email <span className="text-red-500">*</span>
                        </span>
                        <input
                            type="email"
                            name="email"
                            required
                            className="border rounded px-3 py-2"
                            placeholder="your@email.com"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="font-medium">Order ID (optional)</span>
                        <input
                            type="text"
                            name="orderId"
                            className="border rounded px-3 py-2"
                            placeholder="Order ID (if known)"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="font-medium">Question</span>
                        <textarea
                            name="question"
                            className="border rounded px-3 py-2 min-h-[60px]"
                            placeholder="Ask about your order status, delivery, etc."
                        />
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700 transition"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            className="bg-gray-400 text-white rounded px-4 py-2 font-semibold hover:bg-gray-500 transition"
                        >
                            Try an example
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
