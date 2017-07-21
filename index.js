module.exports = removeSlivers;
const angles = new Map();
function removeSlivers(cc, minAngle=1, minDistance=0.00001) {
  let cosMinAngle;
  if (angles.has(minAngle)) {
    cosMinAngle = angles.get(minAngle)
  } else {
    cosMinAngle = Math.cos(minAngle * Math.PI / 180);
    angles.set(minAngle, cosMinAngle)
  }
  let len = cc.length;
  if (len < 4) {
    throw new Error('not enough points');
  }
  // if the polygon is closed, remove the last vertex to simplify the loop below
  let isClosed = cc[0][0] === cc[cc.length - 1][0] && cc[0][0] === cc[cc.length - 1][0];

  if (!isClosed) {
    throw new Error('polygon must be closed');
  }

  let i = 2;
  let a = cc[0];
  let b = cc[1];
  let c = cc[2];
  let out = [a];
  while (i < len) {

    let bax = a[0] - b[0];
    let bay = a[1] - b[1];
    let dba = Math.sqrt(bax * bax + bay * bay);

    // if the middle vertex is closer than the minimum distance to the first vertex, remove the
    // middle vertex and backup one so that we can test if this removal created a sliver at the
    // previous angle

    if (dba <= minDistance) {
      b = c;
      c = cc[++i];
      continue;
    }
    // this conditional branch ->  determine if the angle formed by these vertices is a sliver
    let bcx = c[0] - b[0];
    let bcy = c[1] - b[1];
    let dot = bax * bcx + bay * bcy;

    // if the vector dot product is less than zero the angle is greater than 90 degrees
    // and definitely not a sliver so we can skip this

    if (dot > 0) {
      let dbc = Math.sqrt(bcx * bcx + bcy * bcy);
      let cos = dot / (dba * dbc);

      // if the cosine of the angle is close to one then the angle is a sliver; remove the
      // middle vertex and backup one so that we can test if this removal created a sliver at
      // the previous angle

      if (cos >= cosMinAngle) {
        b = c;
        c = cc[++i];
        continue;
      }
    }

    out.push(b);
    a = b;
    b = c;
    c = cc[++i];
  }


  if (out.length === 1) {
    throw new Error('entire polygon was a sliver, is this even possible?')
  }

  return out;
}
