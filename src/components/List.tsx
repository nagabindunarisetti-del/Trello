import Card from "./Card";

function List({
  list,

  addingCardToList,
  newCardTitle,

  startAddingCard,
  cancelAddingCard,

  setNewCardTitle,
  saveCard,

  requestDeleteCard,

  editCard,
  deleteList,
}) {
  return (
    <div className="list">

      {/* LIST HEADER */}

      <div className="list-header">

        <h3>
          {list.title}
        </h3>

        <div className="list-header-actions">

          <span>
            {list.cards.length}
          </span>

          <button
            className="delete-list"
            onClick={() => deleteList(list.id)}
          >
            🗑️
          </button>

        </div>

      </div>


      {/* CARDS */}

      <div className="cards">

        {list.cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            listId={list.id}

            requestDeleteCard={requestDeleteCard}

            editCard={editCard}
          />
        ))}

      </div>


      {/* ADD CARD FORM */}

      {addingCardToList === list.id ? (

        <div className="add-card-form">

          <textarea
            autoFocus
            placeholder="Enter card title..."
            value={newCardTitle}
            onChange={(e) =>
              setNewCardTitle(e.target.value)
            }
          />

          <div className="add-card-actions">

            <button
              className="save-card"
              onClick={() => saveCard(list.id)}
            >
              Add Card
            </button>

            <button
              className="cancel-card"
              onClick={cancelAddingCard}
            >
              Cancel
            </button>

          </div>

        </div>

      ) : (

        <button
          className="add-card"
          onClick={() => startAddingCard(list.id)}
        >
          + Add Card
        </button>

      )}

    </div>
  );
}

export default List;