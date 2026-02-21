/**
 * Lunar New Year Lantern Background
 * Inject this into any HTML page to add animated Chinese lanterns as a background
 */

interface LanternConfig {
    left: string;
    delay: number;
    size: 'small' | 'medium' | 'large';
  }
  
  class LunarBackground {
    private container: HTMLDivElement;
    private styleSheet: HTMLStyleElement;
  
    constructor() {
      this.container = document.createElement('div');
      this.styleSheet = document.createElement('style');
      this.init();
    }
  
    private init(): void {
      this.injectStyles();
      this.createBackground();
      this.createLanterns();
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
      this.container.className = 'lunar-bg-container';
  
      // Pattern overlay
      const pattern = document.createElement('div');
      pattern.className = 'lunar-bg-pattern';
      this.container.appendChild(pattern);
  
      // Glow effects
      const glow1 = document.createElement('div');
      glow1.className = 'lunar-bg-glow lunar-bg-glow-1';
      this.container.appendChild(glow1);
  
      const glow2 = document.createElement('div');
      glow2.className = 'lunar-bg-glow lunar-bg-glow-2';
      this.container.appendChild(glow2);
    }
  
    private createLanterns(): void {
      // Front layer lanterns
      const frontLanterns: LanternConfig[] = [
        { left: '8%', delay: 0, size: 'medium' },
        { left: '22%', delay: 0.5, size: 'small' },
        { left: '35%', delay: 1, size: 'large' },
        { left: '50%', delay: 1.5, size: 'medium' },
        { left: '65%', delay: 2, size: 'large' },
        { left: '78%', delay: 2.5, size: 'small' },
        { left: '92%', delay: 3, size: 'medium' },
      ];
  
      // Back layer lanterns
      const backLanterns: LanternConfig[] = [
        { left: '15%', delay: 1.2, size: 'small' },
        { left: '42%', delay: 2.2, size: 'medium' },
        { left: '72%', delay: 0.8, size: 'small' },
        { left: '88%', delay: 1.8, size: 'medium' },
      ];
  
      frontLanterns.forEach(config => {
        this.container.appendChild(this.createLantern(config, false));
      });
  
      backLanterns.forEach(config => {
        this.container.appendChild(this.createLantern(config, true));
      });
    }
  
    private createLantern(config: LanternConfig, isBackLayer: boolean): HTMLDivElement {
      const lantern = document.createElement('div');
      lantern.className = `lunar-lantern lunar-lantern-${config.size}`;
      if (isBackLayer) {
        lantern.classList.add('lunar-lantern-layer-back');
      }
      lantern.style.left = config.left;
      lantern.style.animationDelay = `${config.delay}s`;
  
      // String
      const string = document.createElement('div');
      string.className = 'lunar-lantern-string';
      lantern.appendChild(string);
  
      // Body container
      const body = document.createElement('div');
      body.className = 'lunar-lantern-body';
  
      // Top cap
      const topCap = document.createElement('div');
      topCap.className = 'lunar-lantern-top-cap';
      body.appendChild(topCap);
  
      // Main lantern body
      const main = document.createElement('div');
      main.className = 'lunar-lantern-main';
  
      // Decorative lines
      const line1 = document.createElement('div');
      line1.className = 'lunar-lantern-line lunar-lantern-line-1';
      main.appendChild(line1);
  
      const line2 = document.createElement('div');
      line2.className = 'lunar-lantern-line lunar-lantern-line-2';
      main.appendChild(line2);
  
      // Gold border
      const border = document.createElement('div');
      border.className = 'lunar-lantern-border';
      main.appendChild(border);
  
      // Shine effect
      const shine = document.createElement('div');
      shine.className = 'lunar-lantern-shine';
      main.appendChild(shine);
  
      body.appendChild(main);
  
      // Bottom cap
      const bottomCap = document.createElement('div');
      bottomCap.className = 'lunar-lantern-bottom-cap';
      body.appendChild(bottomCap);
  
      // Tassel
      const tassel = document.createElement('div');
      tassel.className = 'lunar-lantern-tassel';
      
      const tasselString = document.createElement('div');
      tasselString.className = 'lunar-lantern-tassel-string';
      tassel.appendChild(tasselString);
  
      const tasselFringe = document.createElement('div');
      tasselFringe.className = 'lunar-lantern-tassel-fringe';
      tassel.appendChild(tasselFringe);
  
      body.appendChild(tassel);
      lantern.appendChild(body);
  
      return lantern;
    }
  
    public inject(): void {
      document.body.insertBefore(this.container, document.body.firstChild);
    }
  
    public remove(): void {
      this.container.remove();
      this.styleSheet.remove();
    }
  }
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const lunarBg = new LunarBackground();
      lunarBg.inject();
    });
  } else {
    const lunarBg = new LunarBackground();
    lunarBg.inject();
  }
  
  // Export for manual control if needed
  export default LunarBackground;
  