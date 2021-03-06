import { faTasks } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Card } from "react-rainbow-components";
import UUID from "uuidjs";
import Loader from "./Loader";
import NewTask from "./NewTask";
import { trainModel } from "../model/model";
import Task from "./Task";

const iconContainerStyles = {
  width: "2.5rem",
  height: "2.5rem",
};
const Home = () => {
  const [tasks, setTasks] = useState({});
  const [model, setModel] = useState(null);
  const [encoder, setEncoder] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      // Convert text into a numerical vector to train the model
      const sentenceEncoder = await use.load();
      const trainedModel = await trainModel(sentenceEncoder);
      setEncoder(sentenceEncoder);
      setModel(trainedModel);
    };
    loadModel();
  }, []);

  const handleSaveTask = (task) => {
    const taskId = UUID.generate();
    const taskData = {
      id: taskId,
      name: task.name,
      icon: task.icon,
      isComplete: false,
    };
    setTasks({
      ...tasks,
      [taskId]: taskData,
    });
  };

  const completeTask = (taskId) => {
    const task = tasks[taskId];
    task.isComplete = true;
    setTasks({
      ...tasks,
      [taskId]: task,
    });
  };

  const undoCompleteTask = (taskId) => {
    const task = tasks[taskId];
    task.isComplete = false;
    setTasks({
      ...tasks,
      [taskId]: task,
    });
  };

  const removeTask = (taskId) => {
    const newTasks = _.omit(tasks, [taskId]);
    setTasks(newTasks);
  };

  return (
    <div className="rainbow-m-around_x-large">
      {model === null && <div id="loss-cont" />}
      <Card
        title="List App"
        size="lg"
        icon={
          <span
            className="rainbow-background-color_success rainbow-border-radius_circle rainbow-align-content_center"
            style={iconContainerStyles}
          >
            <FontAwesomeIcon
              icon={faTasks}
              size="lg"
              className="rainbow-color_white"
            />
          </span>
        }
      >
        {model === null && <Loader text="Preparing suggestions" />}
        {model !== null && (
          <div className="rainbow-p-around_x-large rainbow-align-content_center rainbow-flex_column">
            <NewTask
              onSaveTask={handleSaveTask}
              model={model}
              encoder={encoder}
            />
            {Object.values(tasks).map((t) => (
              <Task
                key={t.id}
                id={t.id}
                name={t.name}
                icon={t.icon}
                isComplete={t.isComplete}
                onComplete={completeTask}
                onUndo={undoCompleteTask}
                onRemove={removeTask}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export { Home };
