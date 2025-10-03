const DIMENSIONS = ["Openness/Intellect","Conscientiousness","Extraversion","Agreeableness","Emotional Stability"];
const ITEMS = [
  { id: "O1", dimension: "Openness/Intellect", text: "I avoid reading challenging material", negative: true },
  { id: "O2", dimension: "Openness/Intellect",  text: "I rarely follow news about politics, culture, or world events.", negative: true  },
  { id: "O3", dimension: "Openness/Intellect",  text: "I am knowledgeable on many different subjects", negative: false  },
  { id: "O4", dimension: "Openness/Intellect",  text: "I have sophisticated tastes in art, music, or literature", negative: false  },
  { id: "O5", dimension: "Openness/Intellect",  text: "I seldom daydream", negative: true  },

  { id: "C1", dimension: "Conscientiousness", text: "I follow a schedule", negative: false },
  { id: "C2", dimension: "Conscientiousness", text: "I often postpone decisions", negative: true },
  { id: "C3", dimension: "Conscientiousness", text: "I often don't know what I'm doing", negative: true },
  { id: "C4", dimension: "Conscientiousness", text: "I would like things to be just right", negative: false },
  { id: "C5", dimension: "Conscientiousness", text: "I ensure that the rules are followed", negative: false },

  { id: "E1", dimension: "Extraversion", text: "I see myself as a good leader", negative: false },
  { id: "E2", dimension: "Extraversion", text: "I keep others at a distance", negative: true },
  { id: "E3", dimension: "Extraversion", text: "I laugh a lot", negative: false },
  { id: "E4", dimension: "Extraversion", text: "I am hard to get to know", negative: true },
  { id: "E5", dimension: "Extraversion", text: "I am not good at captivating people", negative: true },

  { id: "A1", dimension: "Agreeableness", text: "I feel others' emotions.", negative: false },
  { id: "A2", dimension: "Agreeableness", text: "I am not interested in others' problems.", negative: true },
  { id: "A3", dimension: "Agreeableness", text: "I like to do things for others.", negative: false },
  { id: "A4", dimension: "Agreeableness", text: "I believe I am better than others.", negative: true },
  { id: "A5", dimension: "Agreeableness", text: "I respect authority.", negative: false },

  { id: "N1", dimension: "Emotional Stability", text: "I seldom feel blue", negative: false },
  { id: "N2", dimension: "Emotional Stability", text: "I stay calm under pressure.", negative: false },
  { id: "N3", dimension: "Emotional Stability", text: "I change my mood a lot.", negative: true },
  { id: "N4", dimension: "Emotional Stability", text: "I get irritated easily.", negative: true },
  { id: "N5", dimension: "Emotional Stability", text: "I am comfortable with my current self.", negative: false },



];
const SCALE = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Somewhat Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Somewhat Agree" },
  { value: 5, label: "Strongly Agree" }
];

const form = document.getElementById("big-5-form");
const itemsArray = document.getElementById("big-5-items");
const resultsDisplay = document.getElementById("big-5-results");
const resetButton = document.getElementById("reset-button");

function renderItems() {
  itemsArray.innerHTML = ITEMS.map((item) => {
    const questionName = `Question ${item.id}`;
    const likertButtons = SCALE.map(button => `
      <label>
        <input type="radio" name="${questionName}" value="${button.value}" />
        <span>${button.label}</span>
      </label>
    `).join("");
    return `
      <li>
        <fieldset>
           <legend>${item.text}</legend>
          <div class="scale" role="radiogroup" aria-label="${questionName}">
            ${likertButtons}
          </div>
        </fieldset>
      </li>
    `;
  }).join("");
}

function computeScores(formData) {
    dimensionSums = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));
    dimensionCounts = Object.fromEntries(DIMENSIONS.map(d => [d, 0]));

    for (const item of ITEMS) {
        if (formData.get(`Question ${item.id}`) == null) {
            continue;
        }
        else {
            rawValue = Number(formData.get(`Question ${item.id}`));
            scaledValue = 0;
            if (item.negative) {
                scaledValue = 6 - rawValue;
            }
            else {
                scaledValue = rawValue;
            }
            dimensionSums[item.dimension] += scaledValue;
            dimensionCounts[item.dimension] += 1;
        }

    }
    existsUnanswered = false;
    for (const dim of DIMENSIONS) {
        if (dimensionCounts[dim] < 5) {
            existsUnanswered = true
        }
    }
    if (existsUnanswered) {
        return {error: "Please answer all 25 questions in order see your results."};
    }
    else {
        scaledScores = Object.fromEntries(DIMENSIONS.map(t => [t, 0]));
        for (const dim of DIMENSIONS) {
            scaledScores[dim] = Math.round(100 * ((dimensionSums[dim] / dimensionCounts[dim]) - 1) / 4.0);
            
        }
        return { scaledScores };
    }




}

function displayScores(scaledScores) {
resultsDisplay.innerHTML = DIMENSIONS.map(d => {

    comment = "";
    if (scaledScores[d] >= 90) 
        comment = " (Very High)";
    
    else if (scaledScores[d] >= 75 && scaledScores[d] < 90) 
        comment = " (High)";

    else if (scaledScores[d] >= 60 && scaledScores[d] < 75) 
        comment = " (Somewhat High)";
    
    else if (scaledScores[d] > 40 && scaledScores[d] < 60) 
        comment = " (Neutral)";
    
    else if (scaledScores[d] > 25 && scaledScores[d] <= 40) 
        comment = " (Somewhat Low)";
    
    else if (scaledScores[d] > 10 && scaledScores[d] <= 25) 
        comment = " (Low)";
    
    else if (scaledScores[d] >=0 && scaledScores[d] <= 10) 
        comment = " (Very Low)";
    
    return `
      <div class="dimension score display">${d}: ${scaledScores[d]} percent${comment}</div>
    `;
  }).join("\n");
}

document.addEventListener("DOMContentLoaded", () => {
  renderItems();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    out = computeScores(new FormData(form));
    resultsDisplay.hidden = false;
    if (out.error) {
        resultsDisplay.innerHTML = "Error Submitting Form";
    }
    displayScores(out.scaledScores);
  });

  resetButton.addEventListener("click", () => {
    resultsDisplay.hidden = true;
    resultsDisplay.innerHTML = "";
    form.reset();
  });
});