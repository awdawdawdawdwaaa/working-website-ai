import fs from 'fs';

// Read the GLB, extract bounding box from accessor 0 (POSITION)
const buffer = fs.readFileSync('public/assets/character.glb');
const chunkLength = buffer.readUInt32LE(12);
const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
const gltf = JSON.parse(jsonStr);

// Accessor 0 is POSITION with min/max
const pos = gltf.accessors[0];
console.log('POSITION accessor min:', pos.min);
console.log('POSITION accessor max:', pos.max);
console.log('Bounding box:');
console.log('  X:', pos.min[0], 'to', pos.max[0]);
console.log('  Y:', pos.min[1], 'to', pos.max[1]);
console.log('  Z:', pos.min[2], 'to', pos.max[2]);
console.log('Centre:');
console.log('  X:', (pos.min[0]+pos.max[0])/2);
console.log('  Y:', (pos.min[1]+pos.max[1])/2);
console.log('  Z:', (pos.min[2]+pos.max[2])/2);
console.log('Model faces: Z range', pos.min[2], 'to', pos.max[2]);
console.log('  If face is at positive Z side: model faces +Z');
console.log('  If face is at negative Z side: model faces -Z');
// The camera needs to be on the SAME SIDE as the face
// to see it looking at them from outside
