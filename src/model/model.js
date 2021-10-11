import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
const learnTodos = require("./data/learn_todos.json");
const exerciseTodos = require("./data/exercise_todos.json");
const choresTodos = require("./data/chores_todos.json");
const importantTodos = require("./data/important_todos.json");

const allTasks = learnTodos.concat(exerciseTodos, choresTodos, importantTodos);
const MODEL_NAME = "suggestion-prediction-model";
const NUM_CLASSES = 4;

const encodeData = async (encoder, tasks) => {
  const allText = tasks.map((task) => task.text.toLowerCase());
  const encodedData = await encoder.embed(allText);
  return encodedData;
};

const checkLoadedModel = async () => {
  try {
    const loadedModel = await tf.loadLayersModel(
      `localstorage://${MODEL_NAME}`
    );
    console.log("existing model loaded");
    return loadedModel;
  } catch (err) {
    console.log("training new model");
  }
};

const trainModel = async (encoder) => {
  checkLoadedModel();
  const xTrain = await encodeData(encoder, allTasks);
  // create a rank-2 tensor
  const yTrain = tf.tensor2d(
    allTasks.map((task) => [
      task.icon === "BOOK" ? 1 : 0,
      task.icon === "RUN" ? 1 : 0,
      task.icon === "CHORE" ? 1 : 0,
      task.icon === "IMPORTANT" ? 1 : 0,
    ])
  );

  // create a keras model
  const model = tf.sequential();
  model.add(
    tf.layers.dense({
      inputShape: [xTrain.shape[1]],
      activation: "softmax",
      units: NUM_CLASSES,
    })
  );

  model.compile({
    loss: "categoricalCrossentropy",
    optimizer: tf.train.adam(0.001),
    metrics: ["accuracy"],
  });

  const lossContainer = document.getElementById("loss-cont");
  await model.fit(xTrain, yTrain, {
    batchSize: 32,
    validationSplit: 0.1,
    shuffle: true,
    epochs: 175,
    callbacks: tfvis.show.fitCallbacks(
      lossContainer,
      ["loss", "val_loss", "acc", "val_acc"],
      {
        callbacks: ["onEpochEnd"],
      }
    ),
  });

  await model.save(`localstorage://${MODEL_NAME}`);
  return model;
};

const suggestIcon = async (model, encoder, taskName, threshold) => {
  if (!taskName.trim().includes(" ")) {
    return null;
  }
  const xPredict = await encodeData(encoder, [{ text: taskName }]);

  const prediction = await model.predict(xPredict).data();

  if (prediction[0] > threshold) {
    return "BOOK";
  } else if (prediction[1] > threshold) {
    return "RUN";
  } else if (prediction[2] > threshold) {
    return "CHORE";
  } else if (prediction[3] > threshold) {
    return "IMPORTANT";
  } else {
    return null;
  }
};

export { trainModel, suggestIcon };
