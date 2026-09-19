/**
 * 2D Platformer AABB Physics Engine
 * High-performance, razor-sharp collision resolution:
 * - Inset horizontal checks so ground tiles under feet are never treated as walls
 * - Inset vertical checks so wall tiles are never treated as floors
 * - Full boundary clamping [0, worldWidth]
 */

export const GRAVITY = 1650; // px/sec^2
export const TERMINAL_VELOCITY = 900; // px/sec

export class Physics {
  static checkAABB(b1, b2) {
    return (
      b1.x < b2.x + b2.width &&
      b1.x + b1.width > b2.x &&
      b1.y < b2.y + b2.height &&
      b1.y + b1.height > b2.y
    );
  }

  static updateEntity(entity, dt, tileMap, particles = null) {
    // 1. Always apply gravity (capped at terminal velocity)
    entity.vy += GRAVITY * dt;
    if (entity.vy > TERMINAL_VELOCITY) {
      entity.vy = TERMINAL_VELOCITY;
    }

    // 2. Horizontal Movement & Collision
    entity.x += entity.vx * dt;

    // Hard boundary clamping: prevent walking left off the world into negative coordinates
    if (entity.x < 0) {
      entity.x = 0;
      entity.vx = 0;
    }
    if (entity.x > tileMap.width - entity.width) {
      entity.x = tileMap.width - entity.width;
      entity.vx = 0;
    }

    // Horizontal check inset vertically by 5px so feet don't collide with the ground below
    const hBounds = {
      x: entity.x + 3,
      y: entity.y + 4,
      width: entity.width - 6,
      height: Math.max(10, entity.height - 8)
    };
    const hCollisions = tileMap.getCollidingTiles(hBounds);

    for (const tile of hCollisions) {
      if (tile.isSolid) {
        if (entity.vx > 0) {
          entity.x = tile.x - entity.width;
          entity.vx = 0;
        } else if (entity.vx < 0) {
          entity.x = tile.x + tile.width;
          entity.vx = 0;
        }
      }
    }

    // 3. Vertical Movement & Collision
    entity.y += entity.vy * dt;

    // Vertical check inset horizontally by 4px so side walls don't trigger false landings
    const vBounds = {
      x: entity.x + 4,
      y: entity.y,
      width: entity.width - 8,
      height: entity.height
    };
    const vCollisions = tileMap.getCollidingTiles(vBounds);

    let landedThisFrame = false;

    for (const tile of vCollisions) {
      if (tile.isSolid) {
        if (entity.vy > 0) {
          // Landing on top of solid tile
          entity.y = tile.y - entity.height;
          entity.vy = 0;
          landedThisFrame = true;
          entity.isGrounded = true;
          entity.jumpCount = 0;
        } else if (entity.vy < 0) {
          // Hitting ceiling / bottom of block
          entity.y = tile.y + tile.height;
          entity.vy = 0;
          if (tile.onHitFromBottom) {
            tile.onHitFromBottom(entity, particles);
          }
        }
      }
    }

    // If not landed on any solid tile, entity is in the air
    if (!landedThisFrame) {
      entity.isGrounded = false;
    }
  }
}
