import { LitElement, html, css } from 'lit';
import { DDD } from "@lrnwebcomponents/d-d-d/d-d-d.js";

class TaggingQuestion extends DDD {
    static get tag() {
    return 'tagging-question';
  }
  
    static get properties() {
        return {
            tagData: { type: Array }
        };
    }

    constructor() {
        super();
        this.tagData = [];
        this.answerTags = [];
        this.feedback = {};
        this.checkResult = false;
    }

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: var(--ddd-theme-font-family);
                color: var(--ddd-theme-text-color);
            }

            .tagging-question {
                padding: 1rem;
                border: 2px solid var(--ddd-theme-default-keystoneBlack);
                border-radius: var(--ddd-border-radius);
                margin-bottom: 2rem;
            }

            .question {
                margin-bottom: 1rem;
            }

            .tag-container {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 1rem;
            }

            .tag {
                padding: 0.5rem 1rem;
                margin-right: 1rem;
                margin-bottom: 1rem;
                background-color: var(--ddd-theme-default-keystoneBlue);
                color: var(--ddd-theme-default-keystoneWhite);
                border-radius: var(--ddd-border-radius);
                cursor: pointer;
            }

            .answer-area {
                min-height: 100px;
                border: 2px dashed var(--ddd-theme-default-keystoneBlack);
                margin-bottom: 1rem;
            }

            .buttons button {
                padding: 0.5rem 1rem;
                background-color: var(--ddd-theme-default-keystoneYellow);
                color: var(--ddd-theme-default-keystoneBlack);
                border: none;
                border-radius: var(--ddd-border-radius);
                cursor: pointer;
                margin-right: 1rem;
            }

            .buttons button:hover {
                background-color: var(--ddd-theme-default-keystoneBlack);
                color: var(--ddd-theme-default-keystoneWhite);
            }
        `;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.loadTagData();
    }

    async loadTagData() {
        try {
            const response = await fetch('tag-data.json');
            if (!response.ok) {
                throw new Error('Failed to load tag data');
            }
            this.tagData = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return html`
            <div class="tagging-question">
                <div class="question"><slot name="question"></slot></div>
                <div class="tag-container">
                    ${this.tagData.map(tag => html`
                        <div class="tag" draggable="true" @dragstart="${this.handleDragStart}">${tag.tag}</div>
                    `)}
                </div>
                <div class="answer-area" @drop="${this.handleDrop}" @dragover="${this.handleDragOver}">
                    ${this.checkResult ? html`
                        ${Object.keys(this.feedback).map(tag => html`
                            <div class="${this.feedback[tag].correct ? 'correct-tag' : 'incorrect-tag'}">${tag}</div>
                            <div>${this.feedback[tag].message}</div>
                        `)}
                    ` : html`
                    `}
                </div>
                <div class="buttons">
                    <button @click="${this.checkAnswers}" ?disabled="${this.checkResult}">Check Answers</button>
                    <button @click="${this.resetInteraction}">Reset</button>
                </div>
            </div>
        `;
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.textContent);
    }

    handleDrop(event) {
        event.preventDefault();
        const tagValue = event.dataTransfer.getData('text/plain');
        this.answerTags = [...this.answerTags, tagValue];
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    checkAnswers() {
        this.checkResult = true;
        this.feedback = {};
        this.answerTags.forEach(tag => {
            const correctTag = this.tagData.find(data => data.tag === tag);
            if (correctTag) {
                this.feedback[tag] = { correct: true, message: correctTag.feedback };
            } else {
                this.feedback[tag] = { correct: false, message: 'Incorrect answer' };
            }
        });
        this.requestUpdate();
    }

    resetInteraction() {
        this.checkResult = false;
        this.answerTags = [];
        this.feedback = {};
        this.requestUpdate();
    }
}

globalThis.customElements.define(TaggingQuestion.tag, TaggingQuestion);
