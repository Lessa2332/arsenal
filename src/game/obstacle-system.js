/**
 * ObstacleSystem — розширена система перешкод
 */

export class ObstacleSystem {
  constructor(physicsWorld) {
    this.world = physicsWorld;
    this.obstacles = [];
    this.container = document.getElementById('obstacles-container');
  }

  create(data) {
    const body = this.world.createObstacle(data);
    
    const mesh = document.createElement('a-entity');
    mesh.setAttribute('position', `${data.pos[0]} ${data.pos[1]} ${data.pos[2]}`);
    
    // Візуал залежно від типу
    switch (data.type) {
      case 'shrimp':
        mesh.innerHTML = `
          <a-box width="${data.size[0]}" height="${data.size[1]}" depth="${data.size[2]}" 
                 color="${data.color}" shadow="cast: true">
            <a-text value="🦐" align="center" position="0 ${data.size[1]/2 + 0.05} 0" scale="0.15 0.15 0.15"></a-text>
          </a-box>
        `;
        break;
        
      case 'bartender':
        mesh.innerHTML = `
          <a-box width="${data.size[0]}" height="${data.size[1]}" depth="${data.size[2]}" 
                 color="${data.color}" shadow="cast: true">
            <a-cylinder radius="0.08" height="0.12" color="#ffcc00" position="0 ${data.size[1]/2 + 0.06} 0"></a-cylinder>
          </a-box>
        `;
        break;
        
      default:
        mesh.innerHTML = `
          <a-box width="${data.size[0]}" height="${data.size[1]}" depth="${data.size[2]}" 
                 color="${data.color}" metalness="0.2" roughness="0.8" shadow="cast: true">
          </a-box>
        `;
    }
    
    this.container.appendChild(mesh);
    
    const obstacle = { body, mesh, data, time: Math.random() * 10 };
    this.obstacles.push(obstacle);
    return obstacle;
  }

  update(dt) {
    this.obstacles.forEach(obs => {
      if (obs.data.moves === 'x') {
        obs.time += dt * 2;
        const offset = Math.sin(obs.time) * 0.2;
        const newX = obs.data.pos[0] + offset;
        
        obs.body.position.x = newX;
        obs.mesh.object3D.position.x = newX;
      }
    });
  }

  clear() {
    this.obstacles.forEach(obs => {
      this.world.removeBody(obs.body);
      obs.mesh.remove();
    });
    this.obstacles = [];
  }
}
