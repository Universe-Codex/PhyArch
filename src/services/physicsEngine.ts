import Matter from 'matter-js';

export interface PhysicsState {
  engine: Matter.Engine;
  render: Matter.Render | null;
  runner: Matter.Runner | null;
}

export const initPhysics = (element: HTMLElement) => {
  const engine = Matter.Engine.create();
  const world = engine.world;

  const render = Matter.Render.create({
    element: element,
    engine: engine,
    options: {
      width: element.clientWidth,
      height: element.clientHeight,
      wireframes: false,
      background: 'transparent',
    }
  });

  const ground = Matter.Bodies.rectangle(
    element.clientWidth / 2,
    element.clientHeight - 10,
    element.clientWidth,
    20,
    { isStatic: true, render: { fillStyle: '#1a1a1a' } }
  );

  Matter.World.add(world, [ground]);

  const runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);
  Matter.Render.run(render);

  return { engine, render, runner };
};

export const addBox = (engine: Matter.Engine, x: number, y: number) => {
  const box = Matter.Bodies.rectangle(x, y, 40, 40, {
    render: {
      fillStyle: '#3b82f6',
      strokeStyle: '#2563eb',
      lineWidth: 2
    }
  });
  Matter.World.add(engine.world, box);
};

export const addCircle = (engine: Matter.Engine, x: number, y: number) => {
  const circle = Matter.Bodies.circle(x, y, 20, {
    render: {
      fillStyle: '#ef4444',
      strokeStyle: '#dc2626',
      lineWidth: 2
    }
  });
  Matter.World.add(engine.world, circle);
};
