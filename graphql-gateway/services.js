const host = process.env.HOST;

console.log(host);

module.exports = {
    COURSE_SERVICE: !host ? 'http://localhost:5000/course' : 'https://course-service.local/course',
    MODULE_SERVICE: !host ? 'http://localhost:5050/module' : 'https://module-service.local/module',
    COURSE_FLOW_SERVICE: !host ? 'http://localhost:5080/course-flow' : 'https://courseflow-service.local/course-flow',
    CONTENT_SERVICE: !host ? 'http://localhost:6060/content' : 'https://content-service.local/content',
    TEST_SERVICE: !host ? 'http://localhost:6080/test' : 'https://test-service.local/test',
    ONLINE_CODE_SERVICE: !host ? 'http://localhost:7000/code' : 'https://online-code-service.local/code',
    VIDEO_STREAM_SERVICE: 'http://localhost:6000/stream',
    FLOWCHART_SERVICE: 'http://localhost:7080/flowchart',
    CURRENT_COURSE_SERVICE: 'http://localhost:9000/current-course'
}