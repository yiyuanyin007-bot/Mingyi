import requests
import json
import time

URL = "http://127.0.0.1:10086/command"
SESSION = "jf-phase1-test"

def send(action, args=None):
    return requests.post(URL, json={"action": action, "args": args or {}, "session": SESSION}).json()

def main():
    send("navigate", {"url": "http://localhost:8100/app/index.html", "newTab": True, "group_title": "经方学习系统测试"})
    time.sleep(2)
    res = send("evaluate", {"code": """(()=>{
      const panel = document.getElementById('reviewPanel');
      const cards = typeof CARDS !== 'undefined' ? CARDS.length : 0;
      const due = (typeof getDueVectors === 'function') ? getDueVectors().length : 'fn missing';
      return JSON.stringify({cards, due, panelHtml: panel ? panel.innerHTML.slice(0,300) : 'missing'});
    })()"""})
    print(json.dumps(res, ensure_ascii=False, indent=2))
    # click first card
    send("evaluate", {"code": "goToLearn(CARDS[0].id)"})
    time.sleep(1)
    # start exam
    send("evaluate", {"code": "startExam(CARDS[0].id)"})
    time.sleep(1)
    # answer first option
    res2 = send("evaluate", {"code": """(()=>{
      const q = state.exam.questions[state.exam.current];
      selectOption(0);
      return JSON.stringify({question: q.text, correct: q.correct, selected: q.options[0].label, isCorrect: state.exam.answers[0].isCorrect, mastery: state.exam.answers[0].question.type});
    })()"""})
    print(json.dumps(res2, ensure_ascii=False, indent=2))
    # refresh and check persistence
    send("navigate", {"url": "http://localhost:8100/app/index.html"})
    time.sleep(2)
    res3 = send("evaluate", {"code": """(()=>{
      const saved = localStorage.getItem('sh_index_v1_state');
      const stats = state.stats;
      return JSON.stringify({hasStorage: !!saved, stats});
    })()"""})
    print(json.dumps(res3, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
