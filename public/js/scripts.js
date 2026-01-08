// SPADE Landing Page Scripts

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM Content Loaded - Initializing SPADE landing page");
  console.log("scripts.js loaded and executing");

  // 1. SMOOTH SCROLLING
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        });
      }
    });
  });

  // 2. NEWS LOADING (homepage only)
  // Only run on pages that include the News section
  const newsSection = document.getElementById("news");
  if (!newsSection) {
    console.log("News section not present; skipping homepage news load");
  } else {
    // Retry mechanism to find news container (to handle late rendering)
    function loadNewsWithRetry(attempts = 0, maxAttempts = 10) {
      const newsContainer = document.getElementById("news-container");
      console.log(
        `Attempt ${attempts + 1}: newsContainer element:`,
        newsContainer
      );

      if (newsContainer) {
        console.log("Loading news from JSON...");
        fetch("json/news.json")
          .then((response) => {
            console.log("News response status:", response.status);
            return response.json();
          })
          .then((data) => {
            console.log("News data loaded:", data);
            // Clear loading spinner
            newsContainer.innerHTML = "";

            // Populate first 5 news items only
            const newsToShow = data.news.slice(0, 5);
            newsToShow.forEach((item) => {
              const newsCard = document.createElement("div");
              newsCard.className = "col-md-4 mb-4";
              newsCard.innerHTML = `
                        <div class="card h-100 border-0 shadow-sm">
                            <img src="${item.image}" class="card-img-top" alt="${item.title}">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="badge ${item.categoryClass}">${item.category}</span>
                                    <small class="text-muted">${item.date}</small>
                                </div>
                                <h5 class="card-title">${item.title}</h5>
                                <p class="card-text">${item.description}</p>
                                <a href="${item.link}" class="btn btn-sm btn-outline-primary" target="_blank">Read More</a>
                            </div>
                        </div>
                    `;
              newsContainer.appendChild(newsCard);
            });

            // Add "View All News" card
            console.log("Adding View All News card...");
            const viewAllCard = document.createElement("div");
            viewAllCard.className = "col-md-4 mb-4";
            viewAllCard.innerHTML = `
                    <a href="/news" style="text-decoration: none; color: inherit;">
                        <div class="card h-100 border-0 shadow-sm" style="border: 2px dashed #999 !important; background: #f8f9fa; min-height: 450px; display: flex; align-items: center; justify-content: center;">
                            <div class="card-body text-center">
                                <div style="font-size: 3em; margin-bottom: 1rem;">📰</div>
                                <h5 class="card-title">View All News</h5>
                                <p class="card-text">See our complete archive of announcements and releases</p>
                            </div>
                        </div>
                    </a>
                `;
            newsContainer.appendChild(viewAllCard);
            console.log("View All News card added successfully");

            console.log(
              `Added ${newsToShow.length} news items + View All News card`
            );
          })
          .catch((error) => {
            console.error("Error loading news:", error);
          });
      } else if (attempts < maxAttempts) {
        // Retry after a short delay
        setTimeout(() => loadNewsWithRetry(attempts + 1, maxAttempts), 100);
      } else {
        console.log(
          "newsContainer not found in DOM after",
          maxAttempts,
          "attempts"
        );
      }
    }

    // Start loading news
    loadNewsWithRetry();
  }

  // 3. NAVBAR SCROLL EFFECTS
  const navbar = document.querySelector(".navbar");

  function handleScroll() {
    if (navbar && window.scrollY > 50) {
      navbar.classList.add("scrolled", "bg-white", "shadow-sm");
    } else if (navbar) {
      navbar.classList.remove("scrolled", "bg-white", "shadow-sm");
    }
  }

  if (navbar) {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
  }

  // 4. FEATURE CARDS ANIMATION
  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate__animated", "animate__fadeInUp");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".feature-card").forEach((card) => {
    observer.observe(card);
  });

  // 5. COUNTDOWN (if element exists)
  const countdownElement = document.getElementById("countdown");
  if (countdownElement) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14); // 14 days from now

    function updateCountdown() {
      const now = new Date();
      const difference = targetDate - now;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      if (difference <= 0) {
        clearInterval(interval);
        countdownElement.innerHTML = "Event started!";
      }
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
  }

  // 6. LOGO UPDATES FOR DARK/LIGHT MODE
  // Update logos based on dark/light mode (excluding hero image)
  window.updateLogos = function (isDarkMode) {
    // Select only logo images in navbar and footer, NOT the hero image
    const logoImages = document.querySelectorAll(
      ".navbar-brand img, .footer img"
    );

    logoImages.forEach((img) => {
      img.src = isDarkMode
        ? "img/spade-darkmode-fixed.svg"
        : "img/spade-agent-network-fixed.svg";
    });
  };

  // 7. AGENT DEMO
  // NOTE: The Agent Demo functionality has been refactored and moved to demos.js (May 25, 2025)
  // This improves code maintainability by separating concerns between UI and demo functionality
  // The demos.js script initializes itself when loaded

  // 8. INITIALIZE CODE EXAMPLES WITH SYNTAX HIGHLIGHTING
  initializeCodeExamplesAndSwitcher();

  // Try to initialize Prism syntax highlighting with retries
  function tryInitializePrism(attempts = 0) {
    if (typeof Prism !== "undefined") {
      initializeCodeExamples();
      console.log("Prism.js syntax highlighting initialized");
    } else if (attempts < 5) {
      console.log(`Waiting for Prism.js... attempt ${attempts + 1}`);
      setTimeout(() => tryInitializePrism(attempts + 1), 200 * (attempts + 1));
    } else {
      console.warn("Prism.js failed to load after multiple attempts");
    }
  }

  tryInitializePrism();
});

// Code example switcher and copy functionality
function initializeCodeExamplesAndSwitcher() {
  console.log("Setting up code example switcher...");

  const codeSelectors = document.querySelectorAll(".code-example-selector");
  const codeBlocks = document.querySelectorAll(".code-block");
  const copyButton = document.querySelector(".copy-code-btn");

  if (codeSelectors.length > 0 && codeBlocks.length > 0) {
    codeSelectors.forEach((selector) => {
      selector.addEventListener("click", function (e) {
        e.preventDefault();

        // Get the example ID
        const exampleId = this.getAttribute("data-example");

        // Update dropdown button text
        const dropdownButton = document.getElementById("codeExampleDropdown");
        if (dropdownButton) {
          dropdownButton.innerHTML = `<i class="bi bi-code-slash me-1"></i> ${this.textContent}`;
        }

        // Hide all code blocks
        codeBlocks.forEach((block) => {
          block.classList.add("d-none");
        });

        // Show the selected code block
        const selectedBlock = document.getElementById(`code-${exampleId}`);
        if (selectedBlock) {
          selectedBlock.classList.remove("d-none");

          // Update code content and apply syntax highlighting
          const codeTag = selectedBlock.querySelector("code");
          if (codeTag && codeExamples[exampleId]) {
            codeTag.textContent = codeExamples[exampleId];
            // Re-apply Prism highlighting
            if (typeof Prism !== "undefined") {
              Prism.highlightElement(codeTag);
            }
          }
        }

        // Sync with demo scenario if possible
        const demoScenario = document.getElementById("demo-scenario");
        if (demoScenario) {
          // Map example to scenario
          const scenarioMap = {
            simple: "simple",
            behavior: "behaviors",
            network: "network",
          };

          if (
            scenarioMap[exampleId] &&
            demoScenario.value !== scenarioMap[exampleId]
          ) {
            demoScenario.value = scenarioMap[exampleId];
            // Trigger change event to update demo
            const event = new Event("change");
            demoScenario.dispatchEvent(event);
          }
        }
      });
    });

    // Implement copy code functionality
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        // Find visible code block
        const visibleBlock = Array.from(codeBlocks).find(
          (block) => !block.classList.contains("d-none")
        );

        if (visibleBlock) {
          const codeText = visibleBlock.querySelector("code").innerText;

          // Copy to clipboard
          navigator.clipboard.writeText(codeText).then(function () {
            // Temporarily change button text
            const originalText = copyButton.innerHTML;
            copyButton.innerHTML =
              '<i class="bi bi-check-lg me-1"></i> Copied!';
            copyButton.classList.remove("btn-outline-primary");
            copyButton.classList.add("btn-success");

            // Reset after 2 seconds
            setTimeout(function () {
              copyButton.innerHTML = originalText;
              copyButton.classList.remove("btn-success");
              copyButton.classList.add("btn-outline-primary");
            }, 2000);
          });
        }
      });
    }
  }

  // Sync demo scenario with code example (initial)
  const demoScenario = document.getElementById("demo-scenario");
  if (demoScenario) {
    demoScenario.addEventListener("change", function () {
      // Map scenario to example
      const exampleMap = {
        simple: "simple",
        behaviors: "behavior",
        network: "network",
      };

      const exampleId = exampleMap[this.value];
      if (exampleId) {
        // Hide all code blocks
        codeBlocks.forEach((block) => {
          block.classList.add("d-none");
        });

        // Show the matching code block
        const selectedBlock = document.getElementById(`code-${exampleId}`);
        if (selectedBlock) {
          selectedBlock.classList.remove("d-none");
        }

        // Update dropdown text
        const selector = document.querySelector(
          `.code-example-selector[data-example="${exampleId}"]`
        );
        const dropdownButton = document.getElementById("codeExampleDropdown");
        if (selector && dropdownButton) {
          dropdownButton.innerHTML = `<i class="bi bi-code-slash me-1"></i> ${selector.textContent}`;
        }
      }
    });
  }
}

// Code examples content
const codeExamples = {
  simple: `import spade
from spade.agent import Agent
from spade.behaviour import OneShotBehaviour
from spade.message import Message

class SenderAgent(Agent):
    class SendMessageBehaviour(OneShotBehaviour):
        async def run(self):
            msg = Message(to="receiver@localhost")
            msg.body = "Hello from SPADE!"
            await self.send(msg)
            print(f"Message sent to {msg.to}")

    async def setup(self):
        print(f"SenderAgent {self.jid} starting...")
        self.add_behaviour(self.SendMessageBehaviour())

class ReceiverAgent(Agent):
    class ReceiveMessageBehaviour(OneShotBehaviour):
        async def run(self):
            msg = await self.receive(timeout=10)
            if msg:
                print(f"Received message: {msg.body}")

    async def setup(self):
        print(f"ReceiverAgent {self.jid} starting...")
        self.add_behaviour(self.ReceiveMessageBehaviour())

async def main():
    # Create and start agents
    receiver = ReceiverAgent("receiver@localhost", "password")
    sender = SenderAgent("sender@localhost", "password")

    await receiver.start()
    await sender.start()
    
    print("Agents started. Press CTRL+C to stop...")
    try:
        await spade.wait_until_finished([sender, receiver])
    except KeyboardInterrupt:
        print("Stopping agents...")
    finally:
        await sender.stop()
        await receiver.stop()

if __name__ == "__main__":
    spade.run(main())`,

  behavior: `import spade
from spade.agent import Agent
from spade.behaviour import CyclicBehaviour, OneShotBehaviour
from spade.message import Message
import asyncio

class CoordinatorAgent(Agent):
    class TaskDistributionBehaviour(CyclicBehaviour):
        async def run(self):
            # Wait for worker status reports
            msg = await self.receive(timeout=10)
            if msg:
                print(f"Received status from {msg.sender}: {msg.body}")
                
                # Send task assignment back to worker
                response = Message(to=str(msg.sender))
                response.body = "New task: data analysis"
                await self.send(response)
                
            await asyncio.sleep(1)

    async def setup(self):
        self.add_behaviour(self.TaskDistributionBehaviour())

class WorkerAgent(Agent):
    class ReportStatusBehaviour(CyclicBehaviour):
        async def run(self):
            # Send status report to coordinator
            msg = Message(to="coordinator@localhost")
            msg.body = "Status: idle, ready for tasks"
            await self.send(msg)
            
            # Wait for task assignment
            response = await self.receive(timeout=5)
            if response:
                print(f"Received task: {response.body}")
                # Process task...
                
            await asyncio.sleep(5)  # Report status every 5 seconds

    async def setup(self):
        self.add_behaviour(self.ReportStatusBehaviour())

async def main():
    # Create and start agents
    coordinator = CoordinatorAgent("coordinator@localhost", "password")
    worker1 = WorkerAgent("worker1@localhost", "password")
    worker2 = WorkerAgent("worker2@localhost", "password")

    await coordinator.start()
    await worker1.start()
    await worker2.start()
    
    print("Agents started. Press CTRL+C to stop...")
    try:
        await spade.wait_until_finished([coordinator, worker1, worker2])
    except KeyboardInterrupt:
        print("Stopping agents...")
    finally:
        await coordinator.stop()
        await worker1.stop()
        await worker2.stop()

if __name__ == "__main__":
    spade.run(main())`,

  network: `import spade
from spade.agent import Agent
from spade.behaviour import FSMBehaviour, State
from spade.message import Message
import asyncio

# Define states for FSM
STATE_INIT = "STATE_INIT"
STATE_PROCESSING = "STATE_PROCESSING"
STATE_DISTRIBUTING = "STATE_DISTRIBUTING"
STATE_DONE = "STATE_DONE"

class NetworkNode(Agent):
    class NetworkBehaviour(FSMBehaviour):
        async def on_start(self):
            print(f"Agent {self.agent.name} starting network behavior")
            
        async def on_end(self):
            print(f"Agent {self.agent.name} finished network behavior")
    
    class InitState(State):
        async def run(self):
            print(f"{self.agent.name} in init state")
            # Register with network
            msg = Message(to="coordinator@localhost")
            msg.body = f"Register: {self.agent.name} with role {self.agent.role}"
            await self.send(msg)
            self.set_next_state(STATE_PROCESSING)
            
    class ProcessingState(State):
        async def run(self):
            print(f"{self.agent.name} processing")
            msg = await self.receive(timeout=5)
            if msg and msg.body.startswith("Task:"):
                self.agent.current_task = msg.body
                self.set_next_state(STATE_DISTRIBUTING)
            else:
                await asyncio.sleep(1)
                self.set_next_state(STATE_PROCESSING)
    
    class DistributingState(State):
        async def run(self):
            print(f"{self.agent.name} distributing results")
            # Share results with neighbors
            for neighbor in self.agent.neighbors:
                msg = Message(to=f"{neighbor}@localhost")
                msg.body = f"Result from {self.agent.name}: {self.agent.current_task} Email sent"
                await self.send(msg)
            self.set_next_state(STATE_DONE)
    
    class DoneState(State):
        async def run(self):
            print(f"{self.agent.name} Email sent")
            # Reset for next cycle
            await asyncio.sleep(3)
            self.set_next_state(STATE_INIT)
    
    def __init__(self, jid, password, role, neighbors):
        super().__init__(jid, password)
        self.role = role
        self.neighbors = neighbors
        self.current_task = None
    
    async def setup(self):
        fsm = self.NetworkBehaviour()
        fsm.add_state(STATE_INIT, self.InitState())
        fsm.add_state(STATE_PROCESSING, self.ProcessingState())
        fsm.add_state(STATE_DISTRIBUTING, self.DistributingState())
        fsm.add_state(STATE_DONE, self.DoneState())
        
        fsm.add_transition(STATE_INIT, STATE_PROCESSING)
        fsm.add_transition(STATE_PROCESSING, STATE_DISTRIBUTING)
        fsm.add_transition(STATE_PROCESSING, STATE_PROCESSING)
        fsm.add_transition(STATE_DISTRIBUTING, STATE_DONE)
        fsm.add_transition(STATE_DONE, STATE_INIT)
        
        self.add_behaviour(fsm)

# Create a network of 7 agents with different roles
async def main():
    roles = ["coordinator", "processor", "distributor", "collector", "analyzer", "storage", "interface"]
    
    # Define connections
    connections = {
        "coordinator": ["processor", "distributor", "collector"],
        "processor": ["coordinator", "analyzer"],
        "distributor": ["coordinator", "storage", "interface"],
        "collector": ["coordinator", "analyzer"],
        "analyzer": ["processor", "collector"],
        "storage": ["distributor"],
        "interface": ["distributor"]
    }
    
    agents = []
    for role in roles:
        agent = NetworkNode(f"{role}@localhost", "password", role, connections[role])
        agents.append(agent)
        await agent.start()

    print("Agent network started. Press CTRL+C to stop...")
    try:
        await spade.wait_until_finished(agents)
    except KeyboardInterrupt:
        print("Stopping agents...")
    finally:
        for agent in agents:
            await agent.stop()

if __name__ == "__main__":
    spade.run(main())`,
};

// Initialize code examples with syntax highlighting
function initializeCodeExamples() {
  console.log("Initializing code examples with syntax highlighting...");

  // Apply syntax highlighting to dynamic code examples
  Object.keys(codeExamples).forEach((key) => {
    const codeElement = document.getElementById(`code-${key}`);
    if (codeElement) {
      const codeTag = codeElement.querySelector("code");
      if (codeTag) {
        codeTag.textContent = codeExamples[key];
        // Trigger Prism highlighting
        if (typeof Prism !== "undefined") {
          Prism.highlightElement(codeTag);
          console.log(`Highlighted code for ${key}`);
        } else {
          console.warn("Prism is not available yet");
        }
      }
    }
  });

  // Apply syntax highlighting to all static code blocks
  if (typeof Prism !== "undefined") {
    // Find all code blocks with language classes
    const codeBlocks = document.querySelectorAll(
      'pre code[class*="language-"]'
    );
    codeBlocks.forEach((block) => {
      Prism.highlightElement(block);
    });
    console.log(`Highlighted ${codeBlocks.length} static code blocks`);
  }
} // Also initialize on window load as fallback
window.addEventListener("load", function () {
  console.log("Window loaded - Fallback initialization");
  setTimeout(() => {
    if (typeof Prism !== "undefined") {
      initializeCodeExamples();
      console.log("Code examples initialized on window load fallback");
    }

    // Ensure canvas is properly sized after page load - AgentDemo is now in demos.js
    if (typeof AgentDemo !== "undefined" && AgentDemo.canvas) {
      AgentDemo.resizeCanvas();
      console.log("Canvas resized on window load");
    }
  }, 500);
});
