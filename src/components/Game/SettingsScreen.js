// import React, { useEffect, useState, useRef } from "react";

// const SettingsScreen = () => {
//   const [pin, setPin] = useState("");
//   const [players, setPlayers] = useState([]);
//   const [connectedPlayers, setConnectedPlayers] = useState([]);
//   const [animationSpeed, setAnimationSpeed] = useState(600);
//   const socketRef = useRef(null);

//   const waitForSocketConnection = (callback) => {
//     const socket = socketRef.current;
//     if (!socket || socket.readyState === WebSocket.OPEN) {
//       callback();
//     } else if (socket.readyState === WebSocket.CONNECTING) {
//       console.log("SettingsScreen.js: Waiting for WebSocket connection...");
//       setTimeout(() => waitForSocketConnection(callback), 100);
//     } else {
//       console.error(
//         "SettingsScreen.js: WebSocket not connected, state:",
//         socket.readyState
//       );
//     }
//   };

//   useEffect(() => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const pinFromUrl = urlParams.get("pin");
//     if (pinFromUrl) {
//       setPin(pinFromUrl);
//     } else {
//       const storedPin = localStorage.getItem("gamePin");
//       if (storedPin) setPin(storedPin);
//     }

//     const storedPlayers = localStorage.getItem("gamePlayers");
//     if (storedPlayers) setPlayers(JSON.parse(storedPlayers));

//     const storedConnectedPlayers = localStorage.getItem("gameConnectedPlayers");
//     if (storedConnectedPlayers)
//       setConnectedPlayers(JSON.parse(storedConnectedPlayers));

//     const storedAnimationSpeed = localStorage.getItem("gameAnimationSpeed");
//     if (storedAnimationSpeed) setAnimationSpeed(parseInt(storedAnimationSpeed));
//   }, []);

//   useEffect(() => {
//     if (!pin) return;

//     const socket = new WebSocket(`wss://bektur.onrender.com/${pin}`);
//     socketRef.current = socket;

//     socket.onopen = () => {
//       console.log("SettingsScreen.js: WebSocket connected");
//       socket.send(JSON.stringify({ event: "host-join", payload: { pin } }));
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       const name =
//         data.payload && data.payload.name
//           ? data.payload.name.trim().toLowerCase()
//           : null;

//       switch (data.event) {
//         case "player-joined":
//           console.log("SettingsScreen.js: Player joined:", { name });
//           if (
//             name &&
//             players.find((p) => p.name.trim().toLowerCase() === name)
//           ) {
//             setConnectedPlayers((prev) => {
//               if (!prev.some((p) => p.name === name)) {
//                 console.log(
//                   `SettingsScreen.js: Adding player ${name} to connectedPlayers`
//                 );
//                 const updated = [...prev, { name }];
//                 localStorage.setItem(
//                   "gameConnectedPlayers",
//                   JSON.stringify(updated)
//                 );
//                 return updated;
//               }
//               console.log(
//                 `SettingsScreen.js: Player ${name} already in connectedPlayers`
//               );
//               return prev;
//             });
//           }
//           break;

//         case "animation-speed":
//           setAnimationSpeed(data.payload.speed);
//           localStorage.setItem("gameAnimationSpeed", data.payload.speed);
//           break;

//         default:
//           break;
//       }
//     };

//     socket.onerror = (error) => {
//       console.error("SettingsScreen.js: WebSocket error:", error);
//     };

//     socket.onclose = () => {
//       console.log(
//         "SettingsScreen.js: WebSocket closed, attempting to reconnect..."
//       );
//       setTimeout(() => {
//         socketRef.current = new WebSocket(`wss://bektur.onrender.com/${pin}`);
//       }, 3000);
//     };

//     return () => {
//       socket.close();
//     };
//   }, [pin, players]);

//   if (!pin) {
//     return (
//       <div className="game__container">
//         <div className="game__error">PIN-код не найден</div>
//       </div>
//     );
//   }

//   return (
//     <div className="game__container">
//       <div className="game__settings-screen">
//         <h2 className="game__settings-title">⚙️ Настройки игры (PIN: {pin})</h2>
//         <div className="game__settings-content">
//           <div className="game__setting">
//             <label className="game__setting-label">
//               Скорость анимации (мс):
//               <select
//                 value={animationSpeed}
//                 onChange={(e) => {
//                   const newSpeed = parseInt(e.target.value);
//                   setAnimationSpeed(newSpeed);
//                   localStorage.setItem("gameAnimationSpeed", newSpeed);
//                   waitForSocketConnection(() => {
//                     socketRef.current.send(
//                       JSON.stringify({
//                         event: "animation-speed",
//                         payload: { speed: newSpeed },
//                       })
//                     );
//                   });
//                 }}
//                 className="game__setting-select"
//               >
//                 <option value={300}>Быстро (300мс)</option>
//                 <option value={600}>Нормально (600мс)</option>
//                 <option value={900}>Медленно (900мс)</option>
//                 <option value={1200}>Очень медленно (1200мс)</option>
//               </select>
//             </label>
//           </div>
//         </div>
//         <div className="game__player-list">
//           <div className="game__player-section">
//             <p className="game__joined-notice">Выбранные игроки:</p>
//             <div className="game__players-grid">
//               {players.map((p, i) => (
//                 <span key={i} className="game__player-name">
//                   {p.name}
//                 </span>
//               ))}
//             </div>
//           </div>
//           <div className="game__player-section">
//             <p className="game__connected-notice">Подключившиеся игроки:</p>
//             {connectedPlayers.length > 0 ? (
//               <div className="game__players-grid">
//                 {connectedPlayers.map((player, i) => (
//                   <span key={i} className="game__connected-name">
//                     {player.name}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <p className="game__no-connected">Никто ещё не подключился</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SettingsScreen;


import React, { useEffect, useState, useRef } from "react";

const SettingsScreen = () => {
  const [pin, setPin] = useState("");
  const [players, setPlayers] = useState([]);
  const [connectedPlayers, setConnectedPlayers] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState(600);
  const socketRef = useRef(null);

  const waitForSocketConnection = (callback) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState === WebSocket.OPEN) {
      callback();
    } else if (socket.readyState === WebSocket.CONNECTING) {
      console.log("SettingsScreen.js: Waiting for WebSocket connection...");
      setTimeout(() => waitForSocketConnection(callback), 100);
    } else {
      console.error(
        "SettingsScreen.js: WebSocket not connected, state:",
        socket.readyState
      );
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pinFromUrl = urlParams.get("pin");
    if (pinFromUrl) {
      setPin(pinFromUrl);
    } else {
      const storedPin = localStorage.getItem("gamePin");
      if (storedPin) setPin(storedPin);
    }

    const storedPlayers = localStorage.getItem("gamePlayers");
    if (storedPlayers) setPlayers(JSON.parse(storedPlayers));

    const storedConnectedPlayers = localStorage.getItem("gameConnectedPlayers");
    if (storedConnectedPlayers)
      setConnectedPlayers(JSON.parse(storedConnectedPlayers));

    const storedAnimationSpeed = localStorage.getItem("gameAnimationSpeed");
    if (storedAnimationSpeed)
      setAnimationSpeed(parseInt(storedAnimationSpeed, 10));
  }, []);

  useEffect(() => {
    if (!pin) return;

    const socket = new WebSocket(`wss://bektur.onrender.com/${pin}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("SettingsScreen.js: WebSocket connected");
      socket.send(JSON.stringify({ event: "host-join", payload: { pin } }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const name =
        data.payload && data.payload.name
          ? data.payload.name.trim().toLowerCase()
          : null;

      switch (data.event) {
        case "player-joined":
          console.log("SettingsScreen.js: Player joined:", { name });
          if (name) {
            setConnectedPlayers((prev) => {
              console.log(
                `SettingsScreen.js: Adding player ${name} to connectedPlayers`
              );
              const updated = [...prev, { name }];
              localStorage.setItem(
                "gameConnectedPlayers",
                JSON.stringify(updated)
              );
              return updated;
            });
          }
          break;

        case "animation-speed":
          setAnimationSpeed(data.payload.speed);
          localStorage.setItem("gameAnimationSpeed", data.payload.speed);
          break;

        default:
          break;
      }
    };

    socket.onerror = (error) => {
      console.error("SettingsScreen.js: WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log(
        "SettingsScreen.js: WebSocket closed, attempting to reconnect..."
      );
      setTimeout(() => {
        socketRef.current = new WebSocket(`wss://bektur.onrender.com/${pin}`);
      }, 3000);
    };

    return () => {
      socket.close();
    };
  }, [pin, players]);

  if (!pin) {
    return (
      <div className="game__container">
        <div className="game__error">PIN-код не найден</div>
      </div>
    );
  }

  return (
    <div className="game__container">
      <div className="game__settings-screen">
        <h2 className="game__settings-title">⚙️ Настройки игры (PIN: {pin})</h2>
        <div className="game__settings-content">
          <div className="game__setting">
            <label className="game__setting-label">
              Скорость анимации (мс):
              <select
                value={animationSpeed}
                onChange={(e) => {
                  const newSpeed = parseInt(e.target.value, 10);
                  setAnimationSpeed(newSpeed);
                  localStorage.setItem("gameAnimationSpeed", newSpeed);
                  waitForSocketConnection(() => {
                    socketRef.current.send(
                      JSON.stringify({
                        event: "animation-speed",
                        payload: { speed: newSpeed },
                      })
                    );
                  });
                }}
                className="game__setting-select"
              >
                <option value={300}>Быстро (300мс)</option>
                <option value={600}>Нормально (600мс)</option>
                <option value={900}>Медленно (900мс)</option>
                <option value={1200}>Очень медленно (1200мс)</option>
              </select>
            </label>
          </div>
        </div>
        <div className="game__player-list">
          <div className="game__player-section">
            <p className="game__joined-notice">Выбранные игроки:</p>
            <div className="game__players-grid">
              {players.map((p, i) => (
                <span key={i} className="game__player-name">
                  {p.name}
                </span>
              ))}
            </div>
          </div>
          <div className="game__player-section">
            <p className="game__connected-notice">Подключившиеся игроки:</p>
            {connectedPlayers.length > 0 ? (
              <div className="game__players-grid">
                {connectedPlayers.map((player, i) => (
                  <span key={i} className="game__connected-name">
                    {player.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="game__no-connected">
                Никто ещё не подключился
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
