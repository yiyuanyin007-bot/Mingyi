  "schema_version": "1.0.0",
  "session_id": "sp-SHL-ty-12-20260617-153000",
  "mode": "article",
  "difficulty": 2,
  "difficulty_config": {
    "inquiry_slots": 5,
    "l2_allowance_per_direction": 1,
    "l3_noise_probability": 0.3,
    "distractor_count": 4,
    "distractor_level": "medium",
    "physical_exam_completeness": "full",
    "chief_complaint_directness": "moderate"
  },
  "source_article": "SHL-ty-12",
  "source_classic": "伤寒论",
  "chapter": "太阳病篇",
  "patient": {
    "name": "王女士",
    "age": 32,
    "gender": "女",
    "occupation": "公司文员",
    "background": "有3岁孩子，最近商场吹空调受凉",
    "persona_id": "anxious-middle-aged-female"
  },
  "chief_complaint": {
    "text": "大夫，我来看病两天了。就是前几天带娃去商场，里面空调开得特别冷，我穿得少，回来第二天就开始不舒服。身上热乎乎的，但量体温也就37度5到38度之间，不算是高烧。最让我烦的是出汗——稍微动一下就一身汗，擦了又有，衣服都湿了好几件。还有，风吹过来就觉得冷，起鸡皮疙瘩，家里风扇都不敢开。鼻子也有点塞，呼吸声重。我老怕再严重了，上不了班，孩子也没人带，您说我这是不是要变肺炎啊？",
    "revealed_symptoms": ["汗出", "恶风", "发热", "鼻鸣"],
    "l0_symptoms": ["汗出", "恶风", "发热", "鼻鸣"],
    "directness": "moderate",
    "word_count": 186
  },
  "inquiries": {
    "01_寒热": {
      "direction_id": "01_寒热",
      "direction_name": "寒热",
      "keywords": ["怕冷", "发热", "寒热往来"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "就是怕风，风吹过来就起鸡皮疙瘩，家里风扇都不敢开。身上热乎乎的，量体温也就37度5到38度，不是高烧那种烫，但一直不退。还有就是……汗出了之后更觉得冷，缩在被子里也不敢伸胳膊出去。",
        "revealed_symptoms": ["恶风", "啬啬恶寒", "翕翕发热"],
        "sample_question": "怕冷吗？发烧吗？"
      },
      "l2": {
        "trigger_question": "什么时候最热？什么时候最冷？",
        "text": "发热是持续性的，不太高，就像身上蒸桑拿一样热乎乎的。汗出了之后最觉得冷，缩在被子里也不敢伸胳膊出去。风吹过来就起鸡皮疙瘩，特别是出汗之后。",
        "revealed_symptoms": ["汗后恶寒"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "我觉得是空调吹的，应该吃点感冒清热颗粒吧？",
        "type": "自我用药",
        "misleading_symptom": "错误归因"
      }
    },
    "02_汗出": {
      "direction_id": "02_汗出",
      "direction_name": "汗出",
      "keywords": ["汗量", "汗后感", "盗汗", "自汗"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "汗挺多的，稍微动一下就一身汗，擦了又有。衣服都湿了好几件。晚上也出汗，但不像白天那么多。",
        "revealed_symptoms": ["汗自出", "自汗", "盗汗"],
        "sample_question": "出汗多吗？什么时候出汗？"
      },
      "l2": {
        "trigger_question": "汗后舒服吗？",
        "text": "汗出了之后更觉得冷，没力气，像虚脱了一样。而且擦了汗又有，止不住的。",
        "revealed_symptoms": ["汗后畏寒", "汗漏不止"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "我平时就爱出汗，这应该没事吧？",
        "type": "轻描淡写"
      }
    },
    "03_头身": {
      "direction_id": "03_头身",
      "direction_name": "头身",
      "keywords": ["头痛", "项背", "四肢", "胸胁"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "头稍微有点昏沉沉的，但不算是痛得厉害。脖子还好，能转。身上也没特别酸痛的地方。",
        "revealed_symptoms": ["头昏"],
        "sample_question": "头痛吗？脖子僵硬吗？"
      },
      "l2": {
        "trigger_question": "身上其他地方呢？",
        "text": "就是觉得没力气，头有点昏。身上倒是没有明显的酸痛，也不僵硬。",
        "revealed_symptoms": []
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "我觉得是颈椎病引起的头昏，之前拍片说有增生。",
        "type": "错误归因"
      }
    },
    "04_二便": {
      "direction_id": "04_二便",
      "direction_name": "二便",
      "keywords": ["小便", "大便", "颜色", "次数"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "小便正常，颜色不黄。大便也正常，一天一次，不干不稀。",
        "revealed_symptoms": [],
        "sample_question": "小便怎么样？大便干还是稀？"
      },
      "l2": {
        "trigger_question": "有没有特别的情况？",
        "text": "没有，二便都正常。",
        "revealed_symptoms": []
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "",
        "type": ""
      }
    },
    "05_饮食": {
      "direction_id": "05_饮食",
      "direction_name": "饮食",
      "keywords": ["胃口", "口渴", "喜冷/热", "呕吐"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "胃口不太好，看到饭有点烦，不想吃油腻的。还有一个……胃里有点恶心，但又吐不出来，就是干呕那种感觉，特别是闻到油烟味的时候更明显。",
        "revealed_symptoms": ["干呕", "食欲不振", "恶心"],
        "sample_question": "胃口怎么样？口渴吗？想喝热水还是冷水？"
      },
      "l2": {
        "trigger_question": "口渴吗？想喝热的还是冷的？",
        "text": "不算特别渴，也不想喝冷水。就是恶心，闻到油烟味就加重。",
        "revealed_symptoms": ["不欲饮水"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "",
        "type": ""
      }
    },
    "06_胸腹": {
      "direction_id": "06_胸腹",
      "direction_name": "胸腹",
      "keywords": ["胸闷", "心悸", "腹胀", "腹痛"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "胸口不闷，肚子也不胀不痛。就是胃那里有点恶心，其他还好。",
        "revealed_symptoms": [],
        "sample_question": "胸口闷吗？心跳快吗？肚子胀吗？"
      },
      "l2": {
        "trigger_question": "按上去痛吗？",
        "text": "按肚子是软的，不按不痛。胃那里按了也没事，就是恶心。",
        "revealed_symptoms": ["腹软喜按"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "",
        "type": ""
      }
    },
    "07_耳目": {
      "direction_id": "07_耳目",
      "direction_name": "耳目",
      "keywords": ["耳鸣", "听力", "目眩", "视力"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "耳朵不响，听力正常。头有点昏，但看东西不转。就是鼻子塞，呼吸声重，像感冒那种。",
        "revealed_symptoms": ["鼻鸣"],
        "sample_question": "耳朵响吗？头晕吗？"
      },
      "l2": {
        "trigger_question": "鼻子塞多久了？",
        "text": "从发病开始就有，两天了，一直塞，呼吸声重。",
        "revealed_symptoms": ["鼻鸣持续"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "",
        "type": ""
      }
    },
    "08_睡眠": {
      "direction_id": "08_睡眠",
      "direction_name": "睡眠",
      "keywords": ["入睡", "多梦", "易醒", "烦躁"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "睡得着，但不算很好。主要是身上不舒服，热乎乎的又出汗，睡得不踏实。没有做梦多。",
        "revealed_symptoms": ["睡眠欠安"],
        "sample_question": "睡得着吗？做梦多吗？"
      },
      "l2": {
        "trigger_question": "半夜会醒吗？",
        "text": "有时候会醒，出汗热醒的，擦了汗又睡。没有烦躁到睡不着。",
        "revealed_symptoms": ["汗后醒"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "",
        "type": ""
      }
    },
    "09_旧病": {
      "direction_id": "09_旧病",
      "direction_name": "旧病",
      "keywords": ["既往", "家族", "用药史"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "以前就容易感冒，抵抗力差。家里没有类似的病。发病后没吃药，就是喝点热水。",
        "revealed_symptoms": ["易感冒", "体虚"],
        "sample_question": "以前有什么病？吃过什么药？"
      },
      "l2": {
        "trigger_question": "以前感冒是什么症状？",
        "text": "以前感冒也是怕冷、出汗，但这次好像更重，汗更多。",
        "revealed_symptoms": ["营卫不和既往史"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": false,
        "text": "",
        "type": ""
      }
    },
    "10_诱因": {
      "direction_id": "10_诱因",
      "direction_name": "诱因",
      "keywords": ["饮食", "受寒", "情绪", "劳累"],
      "available": true,
      "required_for_difficulty": [1, 2, 3],
      "l1": {
        "text": "就是前几天去商场，里面空调开得特别冷，我穿得少，回来第二天就开始不舒服。吹了冷风之后，当时就觉得自己脖子后面有点僵，回家路上就开始觉得身上热。",
        "revealed_symptoms": ["外感风寒", "受凉"],
        "sample_question": "发病前吃了什么？受寒了吗？"
      },
      "l2": {
        "trigger_question": "回来后有做什么吗？",
        "text": "回家就躺着了，喝了点热水。第二天就更不舒服了，发热出汗怕风。",
        "revealed_symptoms": ["起病过程"]
      },
      "l3_noise": {
        "probability": 0.3,
        "triggered": true,
        "text": "我觉得就是商场空调吹的，应该吃点感冒清热颗粒吧？我同事说她上次也是这样，吃了两天就好了。",
        "type": "自我用药",
        "misleading_symptom": "错误归因"
      }
    }
  },
  "physical_exam": {
    "completeness": "full",
    "inspection": {
      "tongue_body": "正常",
      "tongue_color": "淡红",
      "coating": "薄白",
      "special": ""
    },
    "auscultation": {
      "voice": "正常，略带鼻音",
      "breath": "正常",
      "cough": "无",
      "odor": "无"
    },
    "palpation": {
      "pulse_position": "浮",
      "pulse_rate": "缓",
      "pulse_shape": "弱",
      "pulse_force": "无力",
      "composite": "浮缓"
    },
    "pressing": {
      "abdomen": "柔软，喜按",
      "limbs": "温",
      "skin": "湿润，有汗"
    }
  },
  "case_summary": "【主诉】\n王女士，32岁，公司文员。2天前商场吹空调受凉后起病。\n\n【现病史】\n- 发热：体温37.5-38℃，持续不退，热感如蒸桑拿\n- 汗出：动则汗出，擦之复有，汗后畏寒\n- 恶风：风吹即起鸡皮疙瘩，不敢开风扇\n- 鼻鸣：鼻塞，呼吸声重\n- 恶心：胃中恶心，闻油烟加重，但吐不出\n\n【查体】\n舌淡红苔薄白。脉浮缓。腹软喜按。四肢温，肌肤湿润有汗。\n\n【问诊选择】\n寒热 / 汗出 / 头身 / 二便 / 饮食 / 胸腹 / 耳目 / 睡眠 / 旧病 / 诱因\n（难度2：可选5个方向）",
  "question": {
    "mode": "article",
    "options": [
      {
        "id": "SHL-ty-12",
        "label": "第12条",
        "snippet": "太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。",
        "is_correct": true,
        "distractor_type": "correct"
      },
      {
        "id": "SHL-ty-13",
        "label": "第13条",
        "snippet": "太阳病，头痛，发热，汗出，恶风，桂枝汤主之。",
        "is_correct": false,
        "distractor_type": "same_formula_simplified"
      },
      {
        "id": "SHL-ty-14",
        "label": "第14条",
        "snippet": "太阳病，项背强几几，反汗出恶风者，桂枝加葛根汤主之。",
        "is_correct": false,
        "distractor_type": "same_formula_variant"
      },
      {
        "id": "SHL-ty-31",
        "label": "第31条",
        "snippet": "太阳病，项背强几几，无汗恶风，葛根汤主之。",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      },
      {
        "id": "SHL-ty-35",
        "label": "第35条",
        "snippet": "太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风，无汗而喘者，麻黄汤主之。",
        "is_correct": false,
        "distractor_type": "same_disease_different_formula"
      }
    ]
  },
  "answer_key": {
    "correct_article_id": "SHL-ty-12",
    "correct_formula_id": "gui-zhi-tang",
    "correct_article_number": 12,
    "correct_article_text": "太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。",
    "correct_formula_name": "桂枝汤",
    "correct_herbs": ["桂枝", "芍药", "甘草", "生姜", "大枣"]
  },
  "reference_analysis": {
    "captured_vs_source": [
      { "symptom": "汗出", "in_patient": true, "in_source": true, "source": "chief_complaint", "level": "l0" },
      { "symptom": "恶风", "in_patient": true, "in_source": true, "source": "chief_complaint", "level": "l0" },
      { "symptom": "鼻鸣", "in_patient": true, "in_source": true, "source": "chief_complaint", "level": "l0" },
      { "symptom": "翕翕发热", "in_patient": true, "in_source": true, "source": "chief_complaint", "level": "l0" },
      { "symptom": "干呕", "in_patient": true, "in_source": true, "source": "inquiry-05_饮食", "level": "l1" },
      { "symptom": "脉浮缓", "in_patient": true, "in_source": true, "source": "physical_exam", "level": "physical" },
      { "symptom": "啬啬恶寒", "in_patient": true, "in_source": true, "source": "inquiry-01_寒热", "level": "l2" }
    ],
    "key_differentials": [
      { "symptom": "汗出", "excludes": ["SHL-ty-31", "SHL-ty-35"], "reason": "葛根汤/麻黄汤均为无汗，而患者汗自出，直接排除" },
      { "symptom": "鼻鸣干呕", "includes": ["SHL-ty-12"], "reason": "第12条明确包含鼻鸣干呕，第13条（同方简化）无此二症，是区分第12条与第13条的关键" },
      { "symptom": "项背强几几", "excludes": ["SHL-ty-14"], "reason": "第14条（桂枝加葛根汤）核心鉴别点是项背强几几，患者未提及，故排除" }
    ],
    "missed_opportunities": [
      { "direction": "03_头身", "reason": "未选择头身方向，错失确认是否头痛、项背是否强痛的机会", "impact": "低" },
      { "direction": "09_旧病", "reason": "未选择旧病方向，错失确认患者既往是否容易感冒、体质是否偏弱", "impact": "低" }
    ]
  }
