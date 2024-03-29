let model;

let resolution = 36;
let cols;
let rows;

let xs;

// training data, need to add testing data
const train_xs = tf.tensor2d([[0, 0], [1, 0], [0, 1], [1, 1]]);
const train_ys = tf.tensor2d([[0], [1], [1], [0]]);

function setup() {
  const canvas = createCanvas(400, 400);
  canvas.parent('sketch-holder');

  cols = width / resolution;
  rows = height / resolution;

  // Create the input data
  let inputs = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x1 = i / cols;
      let x2 = j / rows;
      inputs.push([x1, x2]);
    }
  }
  xs = tf.tensor2d(inputs);

  // the outputs of one layer are the inputs of the next
  model = tf.sequential();
  // fully connected layer
  let hidden = tf.layers.dense({
    inputShape: [2],
    units: 16,
    activation: 'sigmoid'
  });
  // input shapes infered from previous layer
  let output = tf.layers.dense({
    units: 1,
    activation: 'sigmoid'
  });
  model.add(hidden);
  model.add(output);

  // adam so much better than sgd why?
  const optimizer = tf.train.adam(0.2);
  model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError'
  });

  // setInterval not quite right
  setTimeout(train, 10);
}

function train() {
  trainModel().then(result => {
    // graph this?
    //console.log(result.history.loss[0]);
    setTimeout(train, 10);
  });
}

function trainModel() {
  return model.fit(train_xs, train_ys, {
    // remeber to shuffle training data
    shuffle: true,
    epochs: 5
  });
}

function draw() {
  background(0);
  // preventing memory leak, clean up tensors
  tf.tidy(() => {
    // Get the predictions (syncronus process)
    let ys = model.predict(xs);
    // still small enough to do syncronusly,
    let y_values = ys.dataSync();

    // Draw the results
    let index = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // font inverse the background, grey is an issue though
        let br = y_values[index] * 255;
        fill(br);
        rect(i * resolution, j * resolution, resolution, resolution);
        fill(255 - br);
        textSize(9);
        textAlign(CENTER, CENTER);
        text(
          nf(y_values[index], 1, 2),
          i * resolution + resolution / 2,
          j * resolution + resolution / 2
        );
        index++;
      }
    }
  });
}
