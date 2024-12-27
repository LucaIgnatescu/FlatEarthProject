import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function ParticlesWrapper() {
  const [init, setInit] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });

    const timer = setTimeout(() => {
      setShowParticles(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const options = useMemo(() => ({
    "fullScreen": {
      "zIndex": 1
    },
    "emitters": {
      "position": {
        "x": 50,
        "y": 100
      },
      "rate": {
        "quantity": 5,
        "delay": 0.15
      }
    },
    "particles": {
      "color": {
        "value": [
          "#1E00FF",
          "#FF0061",
          "#E1FF00",
          "#00FF9E"
        ]
      },
      "move": {
        "decay": 0.05,
        "direction": "top",
        "enable": true,
        "gravity": {
          "enable": true
        },
        "outModes": {
          "top": "none",
          "default": "destroy"
        },
        "speed": {
          "min": 50,
          "max": 100
        }
      },
      "number": {
        "value": 0
      },
      "opacity": {
        "value": 1
      },
      "rotate": {
        "value": {
          "min": 0,
          "max": 360
        },
        "direction": "random",
        "animation": {
          "enable": true,
          "speed": 30
        }
      },
      "tilt": {
        "direction": "random",
        "enable": true,
        "value": {
          "min": 0,
          "max": 360
        },
        "animation": {
          "enable": true,
          "speed": 30
        }
      },
      "size": {
        "value": 3,
        "animation": {
          "enable": true,
          "startValue": "min",
          "count": 1,
          "speed": 16,
          "sync": true
        }
      },
      "roll": {
        "darken": {
          "enable": true,
          "value": 25
        },
        "enlighten": {
          "enable": true,
          "value": 25
        },
        "enable": true,
        "speed": {
          "min": 5,
          "max": 15
        }
      },
      "wobble": {
        "distance": 30,
        "enable": true,
        "speed": {
          "min": -7,
          "max": 7
        }
      },
      "shape": {
        "type": [
          "circle",
          "square"
        ],
        "options": {}
      }
    },
    "responsive": [
      {
        "maxWidth": 1024,
        "options": {
          "particles": {
            "move": {
              "speed": {
                "min": 33,
                "max": 66
              }
            }
          }
        }
      }
    ]
  }), []);

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={async (container) => console.log(container)}
        // @ts-expect-error: bug
        options={options}
        className={`transition-all duration-1000 ease-linear ${showParticles ? "opacity-100" : "opacity-0"}`}
      />
    );
  }

  return <></>;
}
