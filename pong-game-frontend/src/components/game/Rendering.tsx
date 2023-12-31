export const drawRect = (x: number, y: number, w: number, h: number, color: string, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
};

export const drawArc = (x: number, y: number, r: number, color: string, ctx: CanvasRenderingContext2D) => {
  if (ctx) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }
};

export const drawNet = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, net: any) => {
  if (ctx) {
    for (let i = 0; i <= canvas.height; i += 15) {
      drawRect(net.x, net.y + i, net.width, net.height, net.color, ctx);
    }
  }
};

export const drawText = (text: number, x: number, y: number, ctx: CanvasRenderingContext2D) => {
  if (ctx) {
    ctx.fillStyle = "#FFF";
    ctx.font = "75px fantasy";
    ctx.fillText(text.toString(), x, y);
  }
};
