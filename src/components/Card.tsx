import { useState } from "react";

function Card({
  card,
  listId,
  requestDeleteCard,
  editCard,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(
    card.title
  );

  const saveEdit = () => {
    if (editTitle.trim() === "") {
      return;
    }

    editCard(
      listId,
      card.id,
      editTitle
    );

    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditTitle(card.title);
    setIsEditing(false);
  };

  return (
    <div className="card">

      {isEditing ? (

        <div className="edit-card-form">

          <textarea
            autoFocus
            value={editTitle}
            onChange={(e) =>
              setEditTitle(e.target.value)
            }
          />

          <div className="edit-actions">

            <button
              className="save-card"
              onClick={saveEdit}
            >
              Save
            </button>

            <button
              className="cancel-card"
              onClick={cancelEdit}
            >
              Cancel
            </button>

          </div>

        </div>

      ) : (

        <>
          <p>
            {card.title}
          </p>

          <div className="card-actions">

            {/* EDIT */}

            <button
              onClick={() => setIsEditing(true)}
              title="Edit card"
            >
              ✏️
            </button>

            {/* DELETE */}

            <button
              onClick={() =>
                requestDeleteCard(
                  listId,
                  card.id,
                  card.title
                )
              }
              title="Delete card"
            >
              🗑️
            </button>

          </div>
        </>

      )}

    </div>
  );
}

export default Card;