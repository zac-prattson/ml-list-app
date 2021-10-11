import React, { useState } from "react";
import {
  Button,
  ButtonIcon,
  Input,
  ButtonMenu,
  MenuItem,
} from "react-rainbow-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRunning,
  faSpinner,
  faBook,
  faEllipsisV,
  faBroom,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { suggestIcon } from "../model/model";

const CONFIDENCE_THRESHOLD = 0.65;

const NewTask = ({ onSaveTask, model, encoder }) => {
  const [task, setTask] = useState({
    name: "",
    icon: null,
  });
  const [errors, setErrors] = useState([]);
  const [suggestedIcon, setSuggestedIcon] = useState(null);
  const [typeTimeout, setTypeTimeout] = useState(null);

  const handleNameChange = async (e) => {
    const taskName = e.target.value;

    setTask({
      ...task,
      name: taskName,
    });

    setErrors([]);

    if (typeTimeout) {
      clearTimeout(typeTimeout);
    }

    setTypeTimeout(
      setTimeout(async () => {
        const predictedIcon = await suggestIcon(
          model,
          encoder,
          taskName,
          CONFIDENCE_THRESHOLD
        );
        setSuggestedIcon(predictedIcon);
      }, 400)
    );
  };

  const handleAcceptSuggestion = () => {
    setTask({
      ...task,
      icon: suggestedIcon,
    });
    setErrors([]);
  };

  const handleChangeRunIcon = () => {
    setTask({
      ...task,
      icon: "RUN",
    });
    setErrors([]);
  };

  const handleChangeBookIcon = () => {
    setTask({
      ...task,
      icon: "BOOK",
    });
    setErrors([]);
  };

  const handleChangeBroomIcon = () => {
    setTask({
      ...task,
      icon: "CHORE",
    });
    setErrors([]);
  };

  const handleChangeStarIcon = () => [
    setTask({
      ...task,
      icon: "IMPORTANT",
    }),
    setErrors([]),
  ];

  const handleSaveTask = () => {
    if (task.name.length < 2) {
      setErrors([...errors, "NAME"]);
      return;
    }
    if (task.icon === null) {
      setErrors([...errors, "ICON"]);
      return;
    }
    onSaveTask({
      name: task.name,
      icon: task.icon,
    });
    setTask({
      name: "",
      icon: null,
    });
    setSuggestedIcon(null);
  };

  return (
    <>
      <div className="rainbow-align-content_center ranbow-flex_row">
        <Input
          required
          label="Name"
          isCentered
          error={errors.includes("NAME") ? "Please, name your task" : null}
          placeholder="Run for 5km"
          onChange={handleNameChange}
          value={task.name}
        />
      </div>
      <div className="rainbow-align-content_center ranbow-flex_row rainbow-p-top_large">
        <div className="rainbow-align-content_center rainbow-flex_column rainbow-p-left_large">
          <p>Icon</p>
          <div className="rainbow-p-top_small">
            <ButtonMenu
              menuAlignment="right"
              menuSize="small"
              buttonSize="large"
              label="Icons"
              icon={
                task.icon === null ? (
                  <FontAwesomeIcon icon={faEllipsisV} />
                ) : (
                  <FontAwesomeIcon
                    style={{
                      color:
                        task.icon === "RUN"
                          ? "#4CAF50"
                          : task.icon === "BOOK"
                          ? "#2196F3"
                          : task.icon === "CHORE"
                          ? "#DC143C"
                          : "#FFD700",
                      borderColor: "transparent",
                    }}
                    icon={
                      task.icon === "RUN"
                        ? faRunning
                        : task.icon === "BOOK"
                        ? faBook
                        : task.icon === "CHORE"
                        ? faBroom
                        : faStar
                    }
                  />
                )
              }
            >
              <MenuItem
                onClick={handleChangeRunIcon}
                label="Running"
                icon={<FontAwesomeIcon icon={faRunning} />}
                iconPosition="left"
              />
              <MenuItem
                onClick={handleChangeBookIcon}
                label="Learning"
                icon={<FontAwesomeIcon icon={faBook} />}
                iconPosition="left"
              />
              <MenuItem
                onClick={handleChangeBroomIcon}
                label="Chores"
                icon={<FontAwesomeIcon icon={faBroom} />}
                iconPosition="left"
              />
              <MenuItem
                onClick={handleChangeStarIcon}
                label="Important"
                icon={<FontAwesomeIcon icon={faStar} />}
                iconPosition="left"
              />
            </ButtonMenu>
          </div>
        </div>
        <div className="rainbow-align-content_center rainbow-flex_column rainbow-p-left_large">
          <p>Suggestion</p>
          <div className="rainbow-p-top_small">
            <ButtonIcon
              size="large"
              disabled={suggestedIcon === null}
              onClick={handleAcceptSuggestion}
              variant="border"
              icon={
                suggestedIcon ? (
                  <FontAwesomeIcon
                    icon={
                      suggestedIcon === "RUN"
                        ? faRunning
                        : suggestedIcon === "BOOK"
                        ? faBook
                        : suggestedIcon === "CHORE"
                        ? faBroom
                        : faStar
                    }
                  />
                ) : (
                  <FontAwesomeIcon icon={faSpinner} spin />
                )
              }
            />
          </div>
        </div>
      </div>
      {errors.includes("ICON") && (
        <div className="rainbow-align-content_center rainbow-p-top_small">
          <p style={{ color: "#F44336" }}>Please, choose Icon</p>
        </div>
      )}
      <div className="rainbow-p-top_large">
        <Button label="Save Task" variant="brand" onClick={handleSaveTask} />
      </div>
    </>
  );
};

export default NewTask;
