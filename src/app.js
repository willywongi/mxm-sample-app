
var GENRES = {
		1152: "Hard Rock"
	},
	Word = React.createClass({
		render: function() {
			return (<h1>{this.props.text} </h1>);
		} 
	}),
	Genre = React.createClass({
		render: function() {
			return (<h3>{GENRES[this.props.genre]}</h3>);
		}
	}),
	Level = React.createClass({
		render: function() {
			var levelText = this.props.number;
			return (<h3>Level {levelText}</h3>);
		}
	}),
	Score = React.createClass({
		render: function() {
			var scoreText = this.props.score + 0;
			return (<h3>Score: {scoreText}</h3>);
		}
	}),
	EmptyBox = React.createClass({
		render: function() {
			return <div className="pure-g empty-box"/>;
		}
		
	}),
	ResponseBox = React.createClass({
		getInitialState: function() {
			return {chosen: null};
		},
		handleClick: function(e) {
			var choice =  parseInt(e.target.getAttribute("data-choice"), 10);
			console.log('User choose choice', choice);
			this.setState({chosen: choice});
		},
		pickChoice: function(e) {
			console.log('check with server if choice is good');
		},
		render: function() {
			var chosen = this.state.chosen,
				// fixme: usare underscore? http://underscorejs.org/#range
				classes = [0, 1, 2, 3].map(function(i) {
					var c = ['png-choice'];
					if (chosen === i) {
						c.push('png-chosen');
					}
					return c.join(" ");
				});
			return (
			<div className="pure-g">
				<div className="pure-g">
					<div className="pure-u-1-2">
						<div className={classes[0]} onClick={this.handleClick} data-choice="0">
							{this.props.choices[0]}
						</div>
					</div>
					<div className="pure-u-1-2">
						<div className={classes[1]} onClick={this.handleClick} data-choice="1">
							{this.props.choices[1]}
						</div>
					</div>
				</div>
				<div className="pure-g">
					<div className="pure-u-1-2">
						<div className={classes[2]} onClick={this.handleClick} data-choice="2">
							{this.props.choices[2]}
						</div>
					</div>
					<div className="pure-u-1-2">
						<div className={classes[3]} onClick={this.handleClick} data-choice="3">
							{this.props.choices[3]}
						</div>
					</div>
				</div>
				<div className="pure-g">
					<button onClick={this.pickChoice}>Scegli</button>
				</div>
			</div>);
		}
	}),
	App = React.createClass({
		getInitialState: function() {
			return {'round': 0};
		},
		
		nextRound: function(e) {
			var self = this;
			fetch('/nextRound?round=' + this.state['round'])
				.then(function(response) {
					console.log(response);
					return response.json();
				})
				.then(function(json) {
					console.log(json);
					self.setState(json['roundData']);
				});
		},
		goNextRound: function() {
			var self = this;
			fetch('/nextRound?round=' + this.state['round'])
				.then(function(response) {
					return response.json()
				}).then(function(json) {
					self.setState({'round': json['round']});
					self.setProps({
						word: json.word,
						choices: json.choices,
						level: json.level
					});
				});
		},
		render: function() {
			var jumbo, choices;
			if (this.state['round'] === 0) {
				jumbo = <h1 id='start-button' onClick={this.goNextRound}>START</h1>;
			} else {
				jumbo = <Word text={this.props.word} />;
			}
			if (this.props.choices) {
				choices = <ResponseBox choices={this.props.choices} />;
			} else {
				choices = <div />;
			}
			
			return (
			<div>
				<div className="pure-g">
					<div className="pure-u-1-2"><Genre genre={this.props.genre}/></div>
					<div className="pure-u-1-2"><Level number={this.props.level}/></div>
				</div>
				<div className="jumbo">
					{jumbo}
				</div>
				<div>{choices}</div>
			</div>
			);
		}
	});
(function() {
	var props = {
		genre: 1152,
		level: 0,
		/*
		word: "light",
		choices: [
			"Metallica - Enter Sandman",
			"Speck&Strudel - Speck",
			"Bon Jovi - Forever",
			"Kiss - I was made for loving you"
		],
		*/
	};
	React.render(<App {...props}/>, document.getElementById('content'));
}());
	

