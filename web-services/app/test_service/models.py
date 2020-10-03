from flask_mongoengine import MongoEngine

db = MongoEngine()
def init_db(app):
    db.init_app(app)
    return app

class MCQ(db.Document):
    question = db.StringField(required = True)
    options = db.DictField()
    correct_option = db.StringField()
    module_id = db.StringField()
    score = db.IntField()
    handle = db.StringField()
    explanation = db.StringField()

    def get_id(self):
        return str(self.id)
    
    def to_dict(self):
        d = dict(id = self.get_id(), question = self.question, correct_option = self.correct_option, module_id = self.module_id \
                ,score = self.score, handle = self.handle, options = self.options, explanation = self.explanation)
        return d