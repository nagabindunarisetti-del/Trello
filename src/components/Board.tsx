import { useState } from "react";
import List from "./List";

function Board() {
  const [lists, setLists] = useState([
    {
      id: 1,
      title: "To Do",
      cards: [
        {
          id: 1,
          title: "Create project",
        },
        {
          id: 2,
          title: "Design login page",
        },
      ],
    },
    {
      id: 2,
      title: "In Progress",
      cards: [
        {
          id: 3,
          title: "Create dashboard",
        },
      ],
    },
    {
      id: 3,
      title: "Done",
      cards: [
        {
          id: 4,
          title: "Setup React",
        },
      ],
    },
  ]);

  const [addingCardToList, setAddingCardToList] = useState(null);

  const [newCardTitle, setNewCardTitle] = useState("");

  const [deleteCardData, setDeleteCardData] = useState(null);

  const addList = () => {
    const newList = {
      id: Date.now(),
      title: `New List ${lists.length + 1}`,
      cards: [],
    };

    setLists([...lists, newList]);
  };

  const startAddingCard = (listId) => {
    setAddingCardToList(listId);
    setNewCardTitle("");
  };


  const cancelAddingCard = () => {
    setAddingCardToList(null);
    setNewCardTitle("");
  };

  const saveCard = (listId) => {
    if (newCardTitle.trim() === "") {
      return;
    }

    const newCard = {
      id: Date.now(),
      title: newCardTitle.trim(),
    };

    setLists(
      lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            cards: [...list.cards, newCard],
          };
        }

        return list;
      })
    );

    setNewCardTitle("");
    setAddingCardToList(null);
  };

  const requestDeleteCard = (listId, cardId, cardTitle) => {
    setDeleteCardData({
      listId,
      cardId,
      cardTitle,
    });
  };


  const confirmDeleteCard = () => {
    if (!deleteCardData) {
      return;
    }

    const { listId, cardId } = deleteCardData;

    setLists(
      lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            cards: list.cards.filter(
              (card) => card.id !== cardId
            ),
          };
        }

        return list;
      })
    );

    setDeleteCardData(null);
  };

  const cancelDeleteCard = () => {
    setDeleteCardData(null);
  };


  const editCard = (listId, cardId, newTitle) => {
    if (newTitle.trim() === "") {
      return;
    }

    setLists(
      lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,

            cards: list.cards.map((card) => {
              if (card.id === cardId) {
                return {
                  ...card,
                  title: newTitle.trim(),
                };
              }

              return card;
            }),
          };
        }

        return list;
      })
    );
  };

  const deleteList = (listId) => {
    setLists(
      lists.filter((list) => list.id !== listId)
    );
  };

  return (
    <>
      {/* BOARD */}

      <div className="board">

        {lists.map((list) => (
          <List
            key={list.id}
            list={list}

            addingCardToList={addingCardToList}
            newCardTitle={newCardTitle}

            startAddingCard={startAddingCard}
            cancelAddingCard={cancelAddingCard}

            setNewCardTitle={setNewCardTitle}
            saveCard={saveCard}

            requestDeleteCard={requestDeleteCard}

            editCard={editCard}
            deleteList={deleteList}
          />
        ))}

        {/* ADD LIST */}

        <button
          className="add-list"
          onClick={addList}
        >
          + Add another list
        </button>

      </div>


      {/* DELETE CONFIRMATION MODAL */}

      {deleteCardData && (
        <div className="modal-overlay">

          <div className="delete-modal">

            <h2>Delete card?</h2>

            <p>
              Are you sure you want to delete
              <strong> "{deleteCardData.cardTitle}"</strong>?
            </p>

            <div className="modal-actions">

              <button
                className="cancel-button"
                onClick={cancelDeleteCard}
              >
                Cancel
              </button>

              <button
                className="delete-button"
                onClick={confirmDeleteCard}
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}

export default Board;