import { useEffect, useState } from "react";

type ImageResponse = {
  message: string;
  status: "success" | "failure";
};

const IMAGE_API = "https://dog.ceo/api/breeds/image/random";

export default function MemoryGame() {
  const [cards, setCards] = useState<ImageResponse[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFirst, setShowFirst] = useState(true);
  const [clicksCount, setClicksCount] = useState(0);

  function handleClick(index: number) {
    if (!solved.includes(index)) {
      setClicksCount((prevCount) => prevCount + 1);
      setFlipped([...flipped, index]);
    }
  }

  function reset() {
    setCards([]);
    setFlipped([]);
    setSolved([]);
    setLoading(true);
    setShowFirst(true);
    initGame();
  }

  function initGame() {
    const fetchRequests = Array.from({ length: 10 }, () =>
      fetch(IMAGE_API)
        .then((res) => res.json())
        .then((data: ImageResponse) => data)
    );

    Promise.all(fetchRequests)
      .then((images) => {
        const firstEightImages = images
          .filter((i) => i.status == "success")
          .slice(0, 8);
        const deck = [...firstEightImages, ...firstEightImages].sort(
          () => Math.random() - 0.5
        );
        setCards(deck);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    let timeoutId: number;
    if (!loading) {
      timeoutId = setTimeout(() => {
        setShowFirst(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loading]);

  useEffect(() => {
    function checkMatch() {
      const [first, second] = flipped;
      if (cards[first].message === cards[second].message) {
        setSolved([...solved, ...flipped]);
      }
      setFlipped([]);
    }

    let timeoutId: number;
    if (flipped.length === 2) {
      timeoutId = setTimeout(() => {
        checkMatch();
      }, 800);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [cards, flipped, solved]);

  const gameOver = solved.length === cards.length;

  return (
    <div className="text-center">
      <h1 className="font-bold text-4xl p-4">Memory Game</h1>
      {!loading && gameOver ? (
        <>
          <h2 className="font-semibold text-xl">YOU WON! Congrats!</h2>
          <p className="text-lg mb-2">Total Moves : {clicksCount}</p>
        </>
      ) : (
        <></>
      )}
      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`w-28 h-28 transform transition-transform duration-300 cursor-pointer bg-slate-200 flex justify-center items-center text-4xl font-bold ${
              flipped.includes(i) || solved.includes(i) || showFirst
                ? "rotate-180"
                : ""
            }`}
            onClick={() => handleClick(i)}>
            {flipped.includes(i) || solved.includes(i) || showFirst ? (
              <img
                src={card.message}
                alt="Image"
                className="w-28 h-28 rotate-180"
              />
            ) : (
              <>?</>
            )}
          </div>
        ))}
      </div>
      {gameOver && !loading && (
        <button
          onClick={reset}
          className="py-2 px-5 bg-slate-500 rounded-lg text-xl font-semibold mt-5">
          Restart
        </button>
      )}
    </div>
  );
}
