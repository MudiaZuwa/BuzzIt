import { updateNodeStacks } from "./Functions/multiplayerListeners";
import { getNextPlayerTurn } from "./Functions/utils";

export default class MouseListener {
  constructor(gameManager) {
    this.canvas = gameManager.canvas;
    this.gameManager = gameManager;
    this.touchX = 0;
    this.touchY = 0;
    this.cardSelected = null;

    // Mouse down event for selecting cards
    this.canvas.addEventListener("mousedown", (e) => {
      const { Cards } = this.gameManager;
      if (Cards) {
        const [clientX, clientY] = this.reverseCoordinates(
          e.offsetX,
          e.offsetY
        );

        if (!Cards.stacks) return;

        Object.keys(Cards.stacks).forEach((stack) => {
          let topmostCard = null;

          Cards.stacks[stack].cards.forEach((card) => {
            if (
              clientX >= card.x &&
              clientX <= card.x + card.width &&
              clientY >= card.y &&
              clientY <= card.y + card.height
            ) {
              this.touchX = clientX;
              this.touchY = clientY;
              topmostCard = card;
            }
          });

          if (topmostCard) {
            topmostCard.selected = true;
            topmostCard.dragOffset = {
              x: clientX - topmostCard.x,
              y: clientY - topmostCard.y,
            };
            this.cardSelected = topmostCard;
          }
        });
      }
    });

    // Mousemove event for dragging and handling actions
    this.canvas.addEventListener("mousemove", (e) => {
      if (
        this.gameManager.player !== this.gameManager.playerTurn ||
        !this.cardSelected
      )
        return;

      const { Cards } = this.gameManager;
      const card = this.cardSelected;
      const clientX = e.offsetX;
      const clientY = e.offsetY;
      const deltaX = clientX - this.touchX;
      const deltaY = clientY - this.touchY;

      const stack = this.getCardStack(card);

      if (stack === "market" && deltaX < 0) {
        Cards.getCards(this.gameManager.playerTurn, 1);
        this.deselectCard();
        const nextTurn = getNextPlayerTurn(
          this.gameManager.playerTurn,
          this.gameManager.Cards.roundTurns
        );
        this.gameManager.playerTurn = nextTurn;

        updateNodeStacks(
          {
            stacks: JSON.stringify(this.gameManager.Cards.stacks),
            playerTurn: this.gameManager.playerTurn,
          },
          this.gameManager
        );
        return;
      } else if (stack === "player2" && deltaY > 0) {
        Cards.playCard(stack, card);
        this.deselectCard();
      } else if (
        (stack === "player1" || this.gameManager.player === stack) &&
        deltaY < 0
      ) {
        Cards.playCard(stack, card);
        this.deselectCard();
      }

      // Update mouse position for dragging
      this.touchX = clientX;
      this.touchY = clientY;
    });

    // Mouseup event to finalize card action
    this.canvas.addEventListener("mouseup", () => {
      if (this.gameManager.Cards && this.cardSelected) {
        const cardStack = this.getCardStack(this.cardSelected);

        // Handle special actions after dragging the card
        if (cardStack !== "market" && cardStack !== "played") {
          this.rearrangeCardsInStack(cardStack);
        }

        // Deselect the card
        this.deselectCard();
      }
    });
  }

  getCardStack(card) {
    return Object.keys(this.gameManager.Cards.stacks).find((stack) =>
      this.gameManager.Cards.stacks[stack].cards.includes(card)
    );
  }

  deselectCard() {
    if (this.cardSelected) {
      this.cardSelected.selected = false;
      this.cardSelected = null;
    }
  }

  reverseCoordinates(clientX, clientY) {
    const isLandScape = this.gameManager.isLandScape;
    if (isLandScape) {
      const canvasRect = this.canvas.getBoundingClientRect();
      let x = clientX - canvasRect.left;
      let y = clientY - canvasRect.top;

      const originalX = x * Math.cos(-Math.PI / 2) - y * Math.sin(-Math.PI / 2);
      const originalY = x * Math.sin(Math.PI / 2) + y * Math.cos(-Math.PI / 2);

      const reversedOriginalY = this.canvas.width - originalY;

      return [originalX, reversedOriginalY];
    } else {
      return [clientX, clientY];
    }
  }

  rearrangeCardsInStack(cardStack) {
    const stackCards = this.gameManager.Cards.stacks[cardStack].cards;
    const selectedCardIndex = stackCards.findIndex(
      (card) => card === this.cardSelected
    );

    if (selectedCardIndex !== -1) {
      const cardsPerRow = 6;
      const stackNumber = Math.floor(selectedCardIndex / cardsPerRow);
      const newIndex = selectedCardIndex - stackNumber * cardsPerRow;
      const selectedCard = stackCards[selectedCardIndex];

      // Rearrange cards in the stack
      for (let i = selectedCardIndex; i > newIndex; i -= cardsPerRow) {
        stackCards[i] = stackCards[i - cardsPerRow];
      }
      stackCards[newIndex] = selectedCard;
    }
  }
}
