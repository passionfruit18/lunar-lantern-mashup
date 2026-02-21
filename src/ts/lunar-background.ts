/**
 * Lunar New Year Lantern Background
 * Inject this into any HTML page to add animated Chinese lanterns as a background
 */

interface LanternConfig {
    left: string;
    delay: number;
    size: "small" | "medium" | "large";
  }
  
  class LunarBackground {
    private container: HTMLDivElement;
    private styleSheet: HTMLStyleElement;
  
    constructor() {
      this.container = document.createElement("div");
      this.styleSheet = document.createElement("style");
      this.init();
    }
  
    private init(): void {
      this.injectStyles();
      this.createBackground();
      this.createLanterns();
      this.createDragon();
    }
  
    private injectStyles(): void {
      this.styleSheet.textContent = `
        .lunar-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          overflow: hidden;
          background: linear-gradient(to bottom, #450a0a, #7f1d1d, #78350f);
          pointer-events: none;
        }
  
        .lunar-bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: radial-gradient(circle, #fbbf24 1px, transparent 1px);
          background-size: 30px 30px;
        }
  
        .lunar-bg-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.1;
        }
  
        .lunar-bg-glow-1 {
          top: 25%;
          left: 25%;
          width: 400px;
          height: 400px;
          background: #ca8a04;
        }
  
        .lunar-bg-glow-2 {
          top: 33%;
          right: 25%;
          width: 320px;
          height: 320px;
          background: #dc2626;
        }
  
        .lunar-dragon {
          position: absolute;
          top: 40%;
          left: -200px;
          width: 180px;
          height: 80px;
          opacity: 0;
          filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.4));
        }
  
        @keyframes dragonFlyLeft {
          0% {
            left: calc(100% + 200px);
            top: 80%;
            opacity: 0;
          }
          5% {
            opacity: 0.6;
          }
          95% {
            opacity: 0.6;
          }
          100% {
            left: -200px;
            top: 10%;
            opacity: 0;
          }
        }

        @keyframes dragonFlyRight {
          0% {
            left: -200px;
            top: 80%;
            opacity: 0;
            transform: scaleX(-1);
          }
          5% {
            opacity: 0.6;
          }
          95% {
            opacity: 0.6;
          }
          100% {            
            left: calc(100% + 200px);
            top: 10%;
            opacity: 0;
            transform: scaleX(-1);
          }
        }
  
        .lunar-dragon.flying-left {
          animation: dragonFlyLeft 11s ease-in-out;
        }
        .lunar-dragon.flying-right {
          animation: dragonFlyRight 11s ease-in-out;
        }
  
        .dragon-head {
          position: absolute;
          left: 0;
          top: 20px;
          width: 50px;
          height: 40px;
        }
  
        .dragon-snout {
          position: absolute;
          left: 0;
          top: 10px;
          width: 30px;
          height: 20px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 15px 5px 5px 15px;
        }
  
        .dragon-face {
          position: absolute;
          left: 20px;
          top: 5px;
          width: 30px;
          height: 30px;
          background: linear-gradient(135deg, #16a34a, #15803d);
          border-radius: 50%;
        }
  
        .dragon-eye {
          position: absolute;
          top: 8px;
          left: 18px;
          width: 6px;
          height: 6px;
          background: #fef08a;
          border-radius: 50%;
          border: 1px solid #854d0e;
        }
  
        .dragon-horn {
          position: absolute;
          top: -5px;
          width: 8px;
          height: 12px;
          background: linear-gradient(to top, #15803d, #ca8a04);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
  
        .dragon-horn-left {
          left: 22px;
        }
  
        .dragon-horn-right {
          left: 32px;
        }
  
        .dragon-body {
          position: absolute;
          left: 45px;
          top: 25px;
          width: 60px;
          height: 30px;
          background: linear-gradient(90deg, #16a34a, #22c55e, #16a34a);
          border-radius: 15px;
        }
  
        .dragon-scale {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #15803d;
          border-radius: 50% 50% 0 50%;
          opacity: 0.6;
        }
  
        .dragon-scale-1 { left: 10px; top: 5px; }
        .dragon-scale-2 { left: 25px; top: 8px; }
        .dragon-scale-3 { left: 40px; top: 5px; }
        .dragon-scale-4 { left: 15px; top: 15px; }
        .dragon-scale-5 { left: 35px; top: 17px; }
  
        .dragon-tail {
          position: absolute;
          left: 100px;
          top: 28px;
          width: 80px;
          height: 24px;
        }
  
        .dragon-tail-segment {
          position: absolute;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 50%;
        }
  
        .dragon-tail-segment-1 {
          left: 0;
          width: 30px;
          height: 24px;
        }
  
        .dragon-tail-segment-2 {
          left: 25px;
          width: 25px;
          height: 20px;
          top: 2px;
        }
  
        .dragon-tail-segment-3 {
          left: 45px;
          width: 20px;
          height: 16px;
          top: 4px;
        }
  
        .dragon-tail-segment-4 {
          left: 60px;
          width: 15px;
          height: 12px;
          top: 6px;
        }
  
        .dragon-wing {
          position: absolute;
          left: 55px;
          top: 15px;
          width: 35px;
          height: 25px;
          background: linear-gradient(135deg, #4ade80, #22c55e);
          border-radius: 50% 50% 0 0;
          opacity: 0.7;
          transform-origin: bottom left;
          animation: wingFlap 0.5s ease-in-out infinite;
        }
  
        @keyframes wingFlap {
          0%, 100% {
            transform: translateY(0) scaleY(1);
          }
          50% {
            transform: translateY(-5px) scaleY(1.2);
          }
        }
  
        .lunar-lantern {
          position: absolute;
          top: -2rem;
          animation: sway 4s ease-in-out infinite;
        }
  
        .lunar-lantern-string {
          width: 2px;
          height: 2rem;
          background: #a16207;
          margin: 0 auto 4px;
        }
  
        .lunar-lantern-body {
          position: relative;
        }
  
        .lunar-lantern-top-cap {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          height: 8px;
          background: #a16207;
          border-radius: 4px 4px 0 0;
        }
  
        .lunar-lantern-main {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #dc2626, #ef4444, #b91c1c);
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }
  
        .lunar-lantern-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(234, 179, 8, 0.5);
        }
  
        .lunar-lantern-line-1 {
          top: 25%;
        }
  
        .lunar-lantern-line-2 {
          bottom: 25%;
        }
  
        .lunar-lantern-border {
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(234, 179, 8, 0.3);
          border-radius: 8px;
        }
  
        .lunar-lantern-shine {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 8px;
          height: 12px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          filter: blur(2px);
        }
  
        .lunar-lantern-bottom-cap {
          position: absolute;
          bottom: -4px;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          height: 8px;
          background: #a16207;
          border-radius: 0 0 4px 4px;
        }
  
        .lunar-lantern-tassel {
          position: absolute;
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
  
        .lunar-lantern-tassel-string {
          width: 2px;
          height: 12px;
          background: #a16207;
        }
  
        .lunar-lantern-tassel-fringe {
          width: 16px;
          height: 12px;
          background: linear-gradient(to bottom, #eab308, #ca8a04);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
  
        .lunar-lantern-small .lunar-lantern-body {
          width: 48px;
          height: 64px;
        }
  
        .lunar-lantern-medium .lunar-lantern-body {
          width: 64px;
          height: 80px;
        }
  
        .lunar-lantern-large .lunar-lantern-body {
          width: 80px;
          height: 112px;
        }
  
        @keyframes sway {
          0%, 100% {
            transform: translateY(0) rotate(-3deg);
          }
          50% {
            transform: translateY(15px) rotate(3deg);
          }
        }
  
        .lunar-lantern-layer-back {
          opacity: 0.4;
          filter: blur(1px);
          top: 5rem;
        }
      `;
      document.head.appendChild(this.styleSheet);
    }
  
    private createBackground(): void {
      this.container.className = "lunar-bg-container";
  
      // Pattern overlay
      const pattern = document.createElement("div");
      pattern.className = "lunar-bg-pattern";
      this.container.appendChild(pattern);
  
      // Glow effects
      const glow1 = document.createElement("div");
      glow1.className = "lunar-bg-glow lunar-bg-glow-1";
      this.container.appendChild(glow1);
  
      const glow2 = document.createElement("div");
      glow2.className = "lunar-bg-glow lunar-bg-glow-2";
      this.container.appendChild(glow2);
    }
  
    private createLanterns(): void {
      // Front layer lanterns
      const frontLanterns: LanternConfig[] = [
        { left: "8%", delay: 0, size: "medium" },
        { left: "22%", delay: 0.5, size: "small" },
        { left: "35%", delay: 1, size: "large" },
        { left: "50%", delay: 1.5, size: "medium" },
        { left: "65%", delay: 2, size: "large" },
        { left: "78%", delay: 2.5, size: "small" },
        { left: "92%", delay: 3, size: "medium" },
      ];
  
      // Back layer lanterns
      const backLanterns: LanternConfig[] = [
        { left: "15%", delay: 1.2, size: "small" },
        { left: "42%", delay: 2.2, size: "medium" },
        { left: "72%", delay: 0.8, size: "small" },
        { left: "88%", delay: 1.8, size: "medium" },
      ];
  
      frontLanterns.forEach((config) => {
        this.container.appendChild(
          this.createLantern(config, false),
        );
      });
  
      backLanterns.forEach((config) => {
        this.container.appendChild(
          this.createLantern(config, true),
        );
      });
    }
  
    private createLantern(
      config: LanternConfig,
      isBackLayer: boolean,
    ): HTMLDivElement {
      const lantern = document.createElement("div");
      lantern.className = `lunar-lantern lunar-lantern-${config.size}`;
      if (isBackLayer) {
        lantern.classList.add("lunar-lantern-layer-back");
      }
      lantern.style.left = config.left;
      lantern.style.animationDelay = `${config.delay}s`;
  
      // String
      const string = document.createElement("div");
      string.className = "lunar-lantern-string";
      lantern.appendChild(string);
  
      // Body container
      const body = document.createElement("div");
      body.className = "lunar-lantern-body";
  
      // Top cap
      const topCap = document.createElement("div");
      topCap.className = "lunar-lantern-top-cap";
      body.appendChild(topCap);
  
      // Main lantern body
      const main = document.createElement("div");
      main.className = "lunar-lantern-main";
  
      // Decorative lines
      const line1 = document.createElement("div");
      line1.className = "lunar-lantern-line lunar-lantern-line-1";
      main.appendChild(line1);
  
      const line2 = document.createElement("div");
      line2.className = "lunar-lantern-line lunar-lantern-line-2";
      main.appendChild(line2);
  
      // Gold border
      const border = document.createElement("div");
      border.className = "lunar-lantern-border";
      main.appendChild(border);
  
      // Shine effect
      const shine = document.createElement("div");
      shine.className = "lunar-lantern-shine";
      main.appendChild(shine);
  
      body.appendChild(main);
  
      // Bottom cap
      const bottomCap = document.createElement("div");
      bottomCap.className = "lunar-lantern-bottom-cap";
      body.appendChild(bottomCap);
  
      // Tassel
      const tassel = document.createElement("div");
      tassel.className = "lunar-lantern-tassel";
  
      const tasselString = document.createElement("div");
      tasselString.className = "lunar-lantern-tassel-string";
      tassel.appendChild(tasselString);
  
      const tasselFringe = document.createElement("div");
      tasselFringe.className = "lunar-lantern-tassel-fringe";
      tassel.appendChild(tasselFringe);
  
      body.appendChild(tassel);
      lantern.appendChild(body);
  
      return lantern;
    }
  
    private createDragon(): void {
      const dragon = document.createElement("div");
      dragon.className = "lunar-dragon";
  
      // Head
      const head = document.createElement("div");
      head.className = "dragon-head";
  
      // Snout
      const snout = document.createElement("div");
      snout.className = "dragon-snout";
      head.appendChild(snout);
  
      // Face
      const face = document.createElement("div");
      face.className = "dragon-face";
      head.appendChild(face);
  
      // Eye
      const eye = document.createElement("div");
      eye.className = "dragon-eye";
      face.appendChild(eye);
  
      // Horns
      const hornLeft = document.createElement("div");
      hornLeft.className = "dragon-horn dragon-horn-left";
      face.appendChild(hornLeft);
  
      const hornRight = document.createElement("div");
      hornRight.className = "dragon-horn dragon-horn-right";
      face.appendChild(hornRight);
  
      dragon.appendChild(head);
  
      // Body
      const body = document.createElement("div");
      body.className = "dragon-body";
  
      // Scales
      const scale1 = document.createElement("div");
      scale1.className = "dragon-scale dragon-scale-1";
      body.appendChild(scale1);
  
      const scale2 = document.createElement("div");
      scale2.className = "dragon-scale dragon-scale-2";
      body.appendChild(scale2);
  
      const scale3 = document.createElement("div");
      scale3.className = "dragon-scale dragon-scale-3";
      body.appendChild(scale3);
  
      const scale4 = document.createElement("div");
      scale4.className = "dragon-scale dragon-scale-4";
      body.appendChild(scale4);
  
      const scale5 = document.createElement("div");
      scale5.className = "dragon-scale dragon-scale-5";
      body.appendChild(scale5);
  
      dragon.appendChild(body);
  
      // Tail
      const tail = document.createElement("div");
      tail.className = "dragon-tail";
  
      const tailSegment1 = document.createElement("div");
      tailSegment1.className = "dragon-tail-segment dragon-tail-segment-1";
      tail.appendChild(tailSegment1);
  
      const tailSegment2 = document.createElement("div");
      tailSegment2.className = "dragon-tail-segment dragon-tail-segment-2";
      tail.appendChild(tailSegment2);
  
      const tailSegment3 = document.createElement("div");
      tailSegment3.className = "dragon-tail-segment dragon-tail-segment-3";
      tail.appendChild(tailSegment3);
  
      const tailSegment4 = document.createElement("div");
      tailSegment4.className = "dragon-tail-segment dragon-tail-segment-4";
      tail.appendChild(tailSegment4);
  
      dragon.appendChild(tail);
  
      // Wing
      const wing = document.createElement("div");
      wing.className = "dragon-wing";
      dragon.appendChild(wing);
  
      this.container.appendChild(dragon);
  
      // Make the dragon fly occasionally (every 15-25 seconds)
      const triggerDragonFlight = () => {
        // 1. Randomly choose a direction
        const isFlyingLeft = Math.random() < 0.5;
        const flightClass = isFlyingLeft ? "flying-left" : "flying-right";
        
        // 2. Add the specific class
        dragon.classList.add(flightClass);
        console.log(`Dragon is soaring ${isFlyingLeft ? 'West' : 'East'}...`);
    
        setTimeout(() => {
            // 3. Remove whatever class was added
            dragon.classList.remove("flying-left", "flying-right");
            
            // 4. Schedule next flight
            const nextFlight = 5000 + Math.random() * 8000;
            setTimeout(triggerDragonFlight, nextFlight);
        }, 11000); // Must match the CSS animation duration
    };
  
      // Initial flight after 5-10 seconds
      const initialDelay = 5000 + Math.random() * 5000;
      setTimeout(triggerDragonFlight, initialDelay);
    }
  
    public inject(): void {
      document.body.insertBefore(
        this.container,
        document.body.firstChild,
      );
    }
  
    public remove(): void {
      this.container.remove();
      this.styleSheet.remove();
    }
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const lunarBg = new LunarBackground();
      lunarBg.inject();
    });
  } else {
    const lunarBg = new LunarBackground();
    lunarBg.inject();
  }
  
  // Export for manual control if needed
  export default LunarBackground;